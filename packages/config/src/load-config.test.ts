import { loadConfig, ValidateConfigItem } from './load-config'

interface MyConfig {
    // Using any to allow tests to do whatever with this property and not lie about types
    testItem: any
}

it('uses default values', () => {
    const config = loadConfig<MyConfig>({
        values: {},
        defaults: {
            testItem: 'something',
        },
        validateConfig: { testItem: 'optional-string' },
    })

    expect(config.testItem).toBe('something')
})

it('uses driver value before default values', () => {
    const config = loadConfig<MyConfig>({
        values: {
            testItem: 'driver-value',
        },
        defaults: {
            testItem: 'something',
        },
        validateConfig: { testItem: 'required-string' },
    })

    expect(config.testItem).toBe('driver-value')
})

it('uses driver value which fails validation', () => {
    expect(() =>
        loadConfig<MyConfig>({
            values: {
                testItem: 'not-a-bool',
            },
            defaults: {
                testItem: true,
            },
            validateConfig: { testItem: 'required-boolean' },
        }),
    ).toThrow(`testItem has invalid value of: 'not-a-bool'`)
})

describe('validation', () => {
    // Optional string should support basically anything
    it('can validate optional-strings', () => {
        loadConfig<MyConfig>({
            values: {},
            defaults: {},
            validateConfig: { testItem: 'optional-string' },
        })
    })

    it('can validate required-strings', () => {
        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: {},
                validateConfig: { testItem: 'required-string' },
            }),
        ).toThrowError(`testItem has invalid value of: 'undefined'`)
    })

    it('can validate required-strings', () => {
        loadConfig<MyConfig>({
            values: {},
            defaults: { testItem: '' },
            validateConfig: { testItem: 'required-string' },
        })

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: {},
                validateConfig: { testItem: 'required-string' },
            }),
        ).toThrowError(`testItem has invalid value of: 'undefined'`)
    })

    it('can validate non-empty-strings', () => {
        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: '' },
                validateConfig: { testItem: 'non-empty-string' },
            }),
        ).toThrowError(`testItem has invalid value of: ''`)

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: {},
                validateConfig: { testItem: 'non-empty-string' },
            }),
        ).toThrowError(`testItem has invalid value of: 'undefined'`)
    })

    it('can validate optional-booleans', () => {
        const testValues = [
            [undefined, false],
            ['true', true],
            ['false', false],
            [false, false],
            [true, true],
        ]

        testValues.forEach(testValue => {
            const config = loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: testValue[0] },
                validateConfig: { testItem: 'optional-boolean' },
            })
            expect(config.testItem).toBe(testValue[1])
        })

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: '' },
                validateConfig: { testItem: 'optional-boolean' },
            }),
        ).toThrowError(`testItem has invalid value of: ''`)

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: 'doh' },
                validateConfig: { testItem: 'optional-boolean' },
            }),
        ).toThrowError(`testItem has invalid value of: 'doh'`)
    })

    it('can validate required-booleans', () => {
        const testValues = [['true', true], ['false', false], [false, false], [true, true]]

        testValues.forEach(testValue => {
            const config = loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: testValue[0] },
                validateConfig: { testItem: 'optional-boolean' },
            })
            expect(config.testItem).toBe(testValue[1])
        })

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: {},
                validateConfig: { testItem: 'required-boolean' },
            }),
        ).toThrowError(`testItem has invalid value of: 'undefined'`)

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: '' },
                validateConfig: { testItem: 'required-boolean' },
            }),
        ).toThrowError(`testItem has invalid value of: ''`)

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: 'doh' },
                validateConfig: { testItem: 'required-boolean' },
            }),
        ).toThrowError(`testItem has invalid value of: 'doh'`)
    })

    it('can use custom validation', () => {
        const customValidationFunction: ValidateConfigItem = (val: any) =>
            val === 'the-one' ? { valid: val === 'the-one', parsedValue: val } : { valid: false }

        loadConfig<MyConfig>({
            values: {},
            defaults: { testItem: 'the-one' },
            validateConfig: {
                testItem: customValidationFunction,
            },
        })

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: {},
                validateConfig: { testItem: 'non-empty-string' },
            }),
        ).toThrowError(`testItem has invalid value of: 'undefined'`)

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: '' },
                validateConfig: {
                    testItem: customValidationFunction,
                },
            }),
        ).toThrowError(`testItem has invalid value of: ''`)

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: 'different' },
                validateConfig: {
                    testItem: customValidationFunction,
                },
            }),
        ).toThrowError(`testItem has invalid value of: 'different'`)
    })

    it('can validate optionl-ints', () => {
        loadConfig<MyConfig>({
            values: {},
            defaults: {},
            validateConfig: { testItem: 'optional-int' },
        })
        expect(
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: 0 },
                validateConfig: { testItem: 'optional-int' },
            }).testItem,
        ).toBe(0)
        expect(
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: 10 },
                validateConfig: { testItem: 'optional-int' },
            }).testItem,
        ).toBe(10)
        expect(
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: '10' },
                validateConfig: { testItem: 'optional-int' },
            }).testItem,
        ).toBe(10)

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: 'not-number' },
                validateConfig: { testItem: 'optional-int' },
            }),
        ).toThrowError(`testItem has invalid value of: 'not-number'`)
    })

    it('can validate required-ints', () => {
        expect(
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: 0 },
                validateConfig: { testItem: 'required-int' },
            }).testItem,
        ).toBe(0)
        expect(
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: 10 },
                validateConfig: { testItem: 'required-int' },
            }).testItem,
        ).toBe(10)
        expect(
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: '10' },
                validateConfig: { testItem: 'required-int' },
            }).testItem,
        ).toBe(10)

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: { testItem: 'not-number' },
                validateConfig: { testItem: 'required-int' },
            }),
        ).toThrowError(`testItem has invalid value of: 'not-number'`)

        expect(() =>
            loadConfig<MyConfig>({
                values: {},
                defaults: {},
                validateConfig: { testItem: 'required-int' },
            }),
        ).toThrowError(`testItem has invalid value of: 'undefined'`)
    })
})
