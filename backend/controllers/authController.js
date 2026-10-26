import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const getEffectiveProStatus = (user) => {
  if (user.role === 'admin' || user.role === 'doctor') {
    return true;
  }
  return user.isPro || false;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    // secretKey validation for staff (admin/doctor) is now handled in the frontend, but we still validate it here for security.
    const { name, email, password, role, secretKey } = req.body;
    const assignedRole = role || 'patient';

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Secret Key Validation for Staff (Admin/Doctor)
    if (assignedRole === 'admin' || assignedRole === 'doctor') {
      const validKey = process.env.VITALSYNC_SECRET_KEY;
      if (secretKey !== validKey) {
        return res.status(401).json({ message: 'Invalid Platform Access Key. Registration restricted.' });
      }
    }

    const roleCount = await User.countDocuments({ role: assignedRole });
    let prefix = '';
    if (assignedRole === 'admin') prefix = 'ADM-';
    else if (assignedRole === 'doctor') prefix = 'DOC-';
    else prefix = 'PAT-';
    
    const systemId = `${prefix}${String(roleCount + 1).padStart(3, '0')}`;

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      isPro: assignedRole === 'admin' || assignedRole === 'doctor' ? true : false,
      systemId: systemId,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPro: getEffectiveProStatus(user), 
        systemId: user.systemId,
        phone: user.phone,
        age: user.age,
        bloodGroup: user.bloodGroup,
        about: user.about,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPro: getEffectiveProStatus(user), 
        systemId: user.systemId,
        phone: user.phone,
        age: user.age,
        bloodGroup: user.bloodGroup,
        about: user.about,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      const userObj = user.toObject();
      userObj.isPro = getEffectiveProStatus(user); 
      res.status(200).json(userObj);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile (Settings)
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.age = req.body.age !== undefined ? req.body.age : user.age;
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
      user.about = req.body.about !== undefined ? req.body.about : user.about;

      if (req.body.password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(req.body.password)) {
          return res.status(400).json({ 
            message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
          });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isPro: getEffectiveProStatus(updatedUser),
        systemId: updatedUser.systemId,
        phone: updatedUser.phone,
        age: updatedUser.age,
        bloodGroup: updatedUser.bloodGroup,
        about: updatedUser.about,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all doctors for booking dropdown & Admin Doctor Records
// @route   GET /api/auth/doctors
// @access  Private
export const getDoctors = async (req, res) => {
  try {
    // FIX: Removed select limitation so Admin gets full doctor profile (except password)
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all patients for Admin Booking Modal & EHR
// @route   GET /api/auth/patients
// @access  Private
export const getPatients = async (req, res) => {
  try {
    // admin and doctor can see all patients, but doctors will only see their own patients in the booking modal. Admin can see all patients in EHR.
    const patients = await User.find({ role: 'patient' }).select('_id name email systemId phone age bloodGroup about');
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update any user profile (Admin only)
// @route   PUT /api/auth/users/:id
export const updateUserProfileByAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

    // find the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user fields with the request body data. This will overwrite existing fields with new values.
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });

    // Save the updated user to the database
    await user.save();

    // Return the updated user profile without the password field
    const updatedUser = await User.findById(user._id).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any user (Admin only)
// @route   DELETE /api/auth/users/:id
export const deleteUserByAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};