import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const fillFormField = async (labelText: string, value: string) => {
  const field = screen.getByLabelText(labelText)
  await userEvent.type(field, value)
  return field
}

export const selectOption = async (labelText: string, optionText: string) => {
  const select = screen.getByLabelText(labelText)
  fireEvent.change(select, { target: { value: optionText } })
  return select
}

export const submitForm = async (submitButtonText = 'Submit') => {
  const submitButton = screen.getByRole('button', { name: submitButtonText })
  await userEvent.click(submitButton)
  return submitButton
}

export const checkFormValidation = async (
  labelText: string,
  invalidValue: string,
  expectedError: string
) => {
  const field = await fillFormField(labelText, invalidValue)
  field.blur()
  
  const errorMessage = await screen.findByText(expectedError)
  expect(errorMessage).toBeInTheDocument()
}

export const mockFormSubmit = (onSubmit: jest.Mock) => {
  return {
    handleSubmit: (callback: Function) => (e: React.FormEvent) => {
      e.preventDefault()
      callback()
      onSubmit()
    },
    formState: { errors: {} },
    register: jest.fn(),
    reset: jest.fn(),
  }
}
