import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders info', () => {
  const { getByText } = render(<App />);
  const info = getByText(/save to reload/i);
  expect(info).toBeInTheDocument();
});
