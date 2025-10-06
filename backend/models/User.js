const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'] },
  referralCode: { type: String, unique: true, uppercase: true }, // 'required' removed
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isNew) {
    let codeExists = true;
    while (codeExists) {
      const potentialCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingUser = await mongoose.model('User').findOne({ referralCode: potentialCode });
      if (!existingUser) {
        this.referralCode = potentialCode;
        codeExists = false;
      }
    }
  }
  if (this.isModified('password')) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, rounds);
  }
  next();
});

userSchema.methods.comparePassword = async function(password) { return await bcrypt.compare(password, this.password); };
userSchema.methods.toJSON = function() { const user = this.toObject(); delete user.password; return user; };

module.exports = mongoose.model('User', userSchema);