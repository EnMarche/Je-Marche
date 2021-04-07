import { useCallback, useState } from 'react'
import { Keyboard } from 'react-native'
import { Department } from '../../core/entities/Department'
import { regionsRepository } from '../../di/DependencyProvider'

export function useValidateZipCode(
  onSuccess: (department: Department) => void,
  onError: (error: Error) => void,
  onInvalidFormat: () => void,
) {
  const [isLoading, setIsLoading] = useState(false)

  const validateFormat = (value: string) => {
    return value.length === 5
  }

  const validateExistence = useCallback(
    (value: string): Promise<Department> => {
      return regionsRepository.getDepartment(value, 'remote', 'Anonymous')
    },
    [],
  )

  const validateZipCode = useCallback(
    (zipCode: string) => {
      Keyboard.dismiss()
      if (!validateFormat(zipCode)) {
        onInvalidFormat()
        return
      }
      setIsLoading(true)
      validateExistence(zipCode)
        .then(onSuccess)
        .catch(onError)
        .finally(() => setIsLoading(false))
    },
    [onSuccess, onError, onInvalidFormat, validateExistence],
  )

  return {
    validateZipCode,
    isLoading,
  }
}
