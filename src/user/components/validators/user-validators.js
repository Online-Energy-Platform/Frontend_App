function Validate(value, rules) {

    function minLengthValidator(value, minLength) {
        return value.length >= minLength;
    }

    function idValidator(value) {
        return value.length === 36;
    }

    function editFieldValidator(value) {
        return value.length === 0 || minLengthValidator(value, 3);
    }

    function editEmailValidator(value) {
        return value.length === 0 || emailValidator(value);
    }

    function requiredValidator(value) {
        return value.trim() !== '';
    }

    function emailValidator(value) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(value).toLowerCase());
    }

    let isValid = true;

    for (let rule in rules) {

        switch (rule) {
            case 'minLength': isValid = isValid && minLengthValidator(value, rules[rule]);
                break;

            case 'idValidator': isValid = isValid && idValidator(value);
                break;

            case 'editFieldValidator': isValid = isValid && editFieldValidator(value);
                break;

            case 'editEmailValidator': isValid = isValid && editEmailValidator(value);
                break;

            case 'isRequired': isValid = isValid && requiredValidator(value);
                break;

            case 'emailValidator': isValid = isValid && emailValidator(value);
                break;

            default: isValid = true;
        }

    }

    return isValid;
};

export default Validate;
