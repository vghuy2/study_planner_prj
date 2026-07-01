import * as yup from 'yup';

export const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object().shape({
    fullName: yup.string()
        .required('Full Name is required')
        .min(3, 'Full Name must be at least 3 characters'),
    email: yup.string()
        .required('Email is required')
        .email('Invalid email address'),
    password: yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters'),
    confirmPassword: yup.string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),
});
