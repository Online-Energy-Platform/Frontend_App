import {func} from "prop-types";

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

    function editUserIdValidator(value) {
        return value.length === 0 || idValidator(value);
    }

    function editAddressValidator(value) {
        return value.length === 0 || addressValidator(value);
    }

    function editEnergyValidator(value) {
        return value.length === 0 ||energyNumberValidator(value);
    }

    function requiredValidator(value) {
        return value.trim() !== '';
    }

    function addressValidator(value) {
        const re = /^[A-Za-z-]+, [Ss]tr. [A-Za-z-.]+, [Nn]r. [0-9]+, [Bb]l. [A-Za-z0-9-]+, [Aa]p. [0-9-]+$/;
        return re.test(String(value).toLowerCase());
    }

    function energyNumberValidator(value){
        return !isNaN(value) && value > 0;
    }

    let isValid = true;

    for (let rule in rules) {

        switch (rule) {
            case 'minLength': isValid = isValid && minLengthValidator(value, rules[rule]);
                break;

            case 'idValidator': isValid = isValid && idValidator(value);
                break;

            case 'editUserIdValidator': isValid = isValid && editUserIdValidator(value);
                break;

            case 'editFieldValidator': isValid = isValid && editFieldValidator(value);
                break;

            case 'editAddressValidator': isValid = isValid && editAddressValidator(value);
                break;

            case 'editEnergyValidator': isValid = isValid && editEnergyValidator(value);
                break;

            case 'isRequired': isValid = isValid && requiredValidator(value);
                break;

            case 'addressValidator': isValid = isValid && addressValidator(value);
                break;

            case 'energyNumberValidator': isValid = isValid && energyNumberValidator(value);
                break;

            default: isValid = true;
        }

    }

    return isValid;
};

export default Validate;
