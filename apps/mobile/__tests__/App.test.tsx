import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';
// import { createGame } from '@skatehubba/skate-engine';

describe('<App /> Smoke Test', () => {
  it('renders correctly without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toMatchSnapshot();
  });

  // it('can import from shared packages', () => {
  //   expect(createGame).toBeDefined();
  // });
});
