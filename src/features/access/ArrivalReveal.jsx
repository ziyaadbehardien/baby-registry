import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Portal } from '@mui/material';

import WelcomeCurtain from './WelcomeCurtain';

/**
 * Finishes the sign-in transition: when the app is reached from the passphrase screen, the
 * welcome curtain that covered the screen lifts away to reveal it. Clears the navigation state
 * afterwards so a refresh doesn't replay it.
 */
const ArrivalReveal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [welcomedName] = useState(location.state?.welcomed);
  const [isDone, setIsDone] = useState(!location.state?.welcomed);

  if (isDone) return null;

  const handleDone = () => {
    setIsDone(true);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  };

  return (
    <Portal>
      <WelcomeCurtain name={welcomedName} direction="out" onDone={handleDone} />
    </Portal>
  );
};

export default ArrivalReveal;
