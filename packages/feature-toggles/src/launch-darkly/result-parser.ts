import { StringBooleanMap, StringAnyMap, FeatureState } from '../universal'

export const readLdAllFlagsResult = (features: StringAnyMap) => {
    const booleanFeatures = Object.keys(features).reduce<StringBooleanMap>((acc, key) => {
        const toggleValue = features[key]

        // We only support boolean toggles at the moment
        if (typeof toggleValue === 'boolean') {
            // Features in launch darkly use - as separators by default
            // This allows us to continue using _ in code
            acc[key] = toggleValue
        }
        return acc
    }, {})

    // Turn launch darkly flags into our FeatureState
    const ldFeatureState: FeatureState = Object.keys(booleanFeatures).reduce<StringAnyMap>(
        (featureState, key) => {
            const featureValue = booleanFeatures[key]
            if (featureValue !== undefined) {
                featureState[key] = {
                    enabled: featureValue
                }
            }
            return featureState
        },
        {}
    )

    return ldFeatureState
}
