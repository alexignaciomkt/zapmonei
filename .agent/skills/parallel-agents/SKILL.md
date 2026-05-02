arguments[_key4];
        }
        return construct(Func, args);
      };
    }
    /**
     * Add properties to a lookup table
     *
     * @param set - The set to which elements will be added.
     * @param array - The array containing elements to be added to the set.
     * @param transformCaseFunc - An optional function to transform the case of each element before adding to the set.
     * @returns The modified set with added elements.
     */
    function addToSet(set, array) {
      let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;
      if (setPrototypeOf) {
        // Make 'in' and truthy checks like Boolean(set.constructor)
        // independent of any properties defined on Object.prototype.
        // Prevent prototype setters from intercepting set as a this value.
        setPrototypeOf(set, null);
      }
      if (!arrayIsArray(array)) {
        return set;
      }
      let l = array.length;
      while (l--) {
        let element = array[l];
        if (typeof element === 'string') {
          const lcElement = transformCaseFunc(element);
          if (lcElement !== element) {
            // Config presets (e.g. tags.js, attrs.js) are immutable.
            if (!isFrozen(array)) {
              array[l] = lcElement;
            }
            element = lcElement;
          }
        }
        set[element] = true;
      }
      return set;
    }
    /**
     * Clean up an array to harden against CSPP
     *
     * @param array - The array to be cleaned.
     * @returns The cleaned version of the array
     */
    function cleanArray(array) {
      for (let index = 0; index < array.length; index++) {
        const isPropertyExist = objectHasOwnProperty(array, index);
        if (!isPropertyExist) {
          array[index] = null;
        }
      }
      return array;
    }
    /**
     * Shallow clone an object
     *
     * @param object - The object to be cloned.
     * @returns A new object that copies the original.
     */
    function clone(object) {
      const newObject = create(null);
      for (const [property, value] of entries(object)) {
        const isPropertyExist = objectHasOwnProperty(object, property);
        if (isPropertyExist) {
          if (arrayIsArray(value)) {
            newObject[property] = cleanArray(value);
          } else if (value && typeof value === 'object' && value.constructor === Object) {
            newObject[property] = clone(value);
          } else {
            newObject[property] = value;
          }
        }
      }
      return newObject;
    }
    /**
     * Convert non-node values into strings without depending on direct property access.
     *
     * @param value - The value to stringify.
     * @returns A string representation of the provided value.
     */
    function stringifyValue(value) {
      switch (typeof value) {
        case 'string':
          {
            return value;
          }
        case 'number':
          {
            return numberToString(value);
          }
        case 'boolean':
          {
            return booleanToString(value);
          }
        case 'bigint':
          {
            return bigintToString ? bigintToString(value) : '0';
          }
        case 'symbol':
          {
            return symbolToString ? symbolToString(value) : 'Symbol()';
          }
        case 'undefined':
          {
            return objectToString(value);
          }
        case 'function':
        case 'object':
          {
            if (value === null) {
              return objectToString(value);
            }
            const valueAsRecord = value;
            const valueToString = lookupGetter(valueAsRecord, 'toString');
            if (typeof valueToString === 'function') {
              const stringified = valueToString(valueAsRecord);
              return typeof stringified === 'string' ? stringified : objectToString(stringified);
            }
            return objectToString(value);
          }
        default:
          {
            return objectToString(value);
          }
      }
    }
    /**
     * This method automatically checks if the prop is function or getter and behaves accordingly.
     *
     * @param object - The object to look up the getter function in its prototype chain.
     * @param prop - The property name for which to find the getter function.
     * @returns The getter function found in the prototype chain or a fallback function.
     */
    function lookupGetter(object, prop) {
      while (object !== null) {
        const desc = getOwnPropertyDescriptor(object, prop);
        if (desc) {
          if (desc.get) {
            return unapply(desc.get);
          }
          if (typeof desc.value === 'function') {
            return unapply(desc.value);
          }
        }
        object = getPrototypeOf(object);
      }
      function fallbackValue() {
        return null;
      }
      return fallbackValue;
    }
    function isRegex(value) {
      try {
        regExpTest(value, '');
        return true;
      } catch (_unused) {
        return false;
      }
    }

    const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption'