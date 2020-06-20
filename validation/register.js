const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatorRegisterInput(data) {
    let errors = {};

    //Validate Name
    if (!validator.isLength(data.name, {
            min: 2,
            max: 30
        })) {
        errors.name = 'Name must be between 2 and 30 characters';
    }

    if (isEmpty(data.name)) {
        errors.name = 'Name cannot be Empty';
    }

    //Validate Email
    if (isEmpty(data.email)) {
        errors.email = 'Email field is reuired';
    }

    if (!validator.isEmpty(data.email)) {
        errors.email = 'Enter a valid Email ID';
    }

    //Validate Password
    if (isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    if (isEmpty(data.password2)) {
        errors.password2 = 'Confirm Password field is required';
    }

    if (!validator.isLength(data.password, {
            min: 8,
            max: 30
        })) {
        errors.password = 'Password must be between 8 and 30 characters';
    }

    if (!validator.equals(data.password, data.password2)) {
        errors.password2 = 'Passwords must match';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

// module.exports = validateRegisterInput;