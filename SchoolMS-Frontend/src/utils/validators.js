export const validators = {
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: v => /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(v),
  password: v => v && v.length >= 8,
  required: v => v !== null && v !== undefined && String(v).trim() !== '',
  minLength: (v, min) => v && v.length >= min,
  maxLength: (v, max) => v && v.length <= max,
  numeric: v => /^\d+$/.test(v),
  alphanumeric: v => /^[a-zA-Z0-9]+$/.test(v),
};

export const validateLoginForm = ({identifier, password}) => {
  const errors = {};
  if (!validators.required(identifier)) errors.identifier = 'This field is required';
  if (!validators.required(password)) errors.password = 'Password is required';
  else if (!validators.minLength(password, 8)) errors.password = 'Password must be at least 8 characters';
  return errors;
};

export const validateRegisterForm = ({name, email, phone, password, confirmPassword}) => {
  const errors = {};
  if (!validators.required(name)) errors.name = 'Name is required';
  if (!validators.required(email)) errors.email = 'Email is required';
  else if (!validators.email(email)) errors.email = 'Invalid email address';
  if (phone && !validators.phone(phone)) errors.phone = 'Invalid phone number';
  if (!validators.required(password)) errors.password = 'Password is required';
  else if (!validators.minLength(password, 8)) errors.password = 'Password must be at least 8 characters';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};
