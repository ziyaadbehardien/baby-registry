import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router';

import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  LinearProgress,
  Portal,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { useEnterRegistryMutation } from '../features/access/accessApiSlice';
import { MOTION, riseIn, shake, usePrefersReducedMotion } from '../features/access/accessMotion';
import WelcomeCurtain from '../features/access/WelcomeCurtain';
import { getErrorMessage } from '../features/api/apiSlice';
import { useGetMeQuery, userApiSlice } from '../features/user/userApiSlice';

import AuthPageShell, { frostedPanel } from 'components/AuthPageShell';
import Loader from 'components/Loader';

import { tones } from 'assets/theme';

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

// Form rows appear one after another once the card has risen in (see AuthPageShell).
const STAGGER_START_MS = 800;
const STAGGER_STEP_MS = 90;
// After this the entrance styles are dropped, so rows added later (e.g. an error) show at once.
const INTRO_DONE_MS = 1600;
const staggeredRows = Object.fromEntries(
  Array.from({ length: 6 }, (_, index) => [
    `& > *:nth-of-type(${index + 1})`,
    { animationDelay: `${STAGGER_START_MS + index * STAGGER_STEP_MS}ms` },
  ])
);

/** The passphrase screen: nothing else in the app is reachable until this succeeds. */
const WelcomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me, isLoading: isCheckingSession } = useGetMeQuery();
  const [enterRegistry, { isLoading, error }] = useEnterRegistryMutation();
  const [showPassphrase, setShowPassphrase] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  // 'form' → 'entering' (curtain drops with the welcome message) → navigate into the app.
  const [phase, setPhase] = useState('form');
  const [enteredName, setEnteredName] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isIntroDone, setIsIntroDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsIntroDone(true), INTRO_DONE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', passphrase: '' } });

  if (isCheckingSession) return <Loader fullPage />;
  // Already in (e.g. a returning visitor) — but not mid-way through our own welcome animation.
  if (me && phase === 'form') return <Navigate to="/" replace />;

  const goToApp = (name) =>
    navigate(location.state?.from ?? '/', { replace: true, state: { welcomed: name } });

  const handleEnter = async (values) => {
    try {
      const { name } = await enterRegistry(values).unwrap();
      // Wait for the new session to be confirmed before leaving, so the app doesn't
      // briefly see the old "not signed in" answer.
      await dispatch(userApiSlice.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
      if (reducedMotion) {
        goToApp(null);
        return;
      }
      setEnteredName(name);
      setPhase('entering');
    } catch {
      // The error is shown from the mutation state below; give the card a little shake.
      if (!reducedMotion) setIsShaking(true);
    }
  };

  const handleCurtainCovered = () => {
    // Hold the welcome message briefly, then move into the app (where the curtain lifts away).
    window.setTimeout(() => goToApp(enteredName), MOTION.welcomeHoldMs);
  };

  const isBusy = isLoading || phase === 'entering';

  return (
    <AuthPageShell>
      {/* Portalled to <body>: the form column is transformed during its rise-in, which would
          otherwise trap these fixed-position layers inside it. */}
      <Portal>
        {/* Thin progress line across the top while the passphrase is checked. */}
        {isBusy && (
          <LinearProgress
            aria-label="Checking passphrase"
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              borderRadius: 0,
              zIndex: 'tooltip',
            }}
          />
        )}
        {phase === 'entering' && (
          <WelcomeCurtain name={enteredName} direction="in" onDone={handleCurtainCovered} />
        )}
      </Portal>

      <Typography
        variant="h1"
        sx={{
          textAlign: 'center',
          px: 1,
          // On phones the form column overlaps the banner; keep the title clear of the artwork.
          mt: { xs: 5, md: 0 },
          transition: `opacity 300ms ${MOTION.ease}`,
          ...(phase === 'entering' && { opacity: 0 }),
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'block',
            color: tones.primary[30],
            fontSize: { xs: '2.2rem', sm: '2.6rem' },
            lineHeight: 1.1,
          }}
        >
          Ziyaad &amp; Tash&apos;s
        </Box>
        <Box
          component="span"
          sx={{
            display: 'block',
            mt: 1,
            color: 'secondary.dark',
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
          }}
        >
          Baby Registry
        </Box>
      </Typography>

      <Card
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) setIsShaking(false);
        }}
        sx={{
          ...frostedPanel,
          width: '100%',
          p: { xs: 3, sm: 4 },
          animation: isShaking ? `${shake} 450ms ${MOTION.ease}` : 'none',
          transition: `opacity 300ms ${MOTION.ease}, transform 300ms ${MOTION.ease}`,
          ...(phase === 'entering' && { opacity: 0, transform: 'translateY(-12px)' }),
        }}
      >
        <form onSubmit={handleSubmit(handleEnter)} noValidate>
          <Stack
            spacing={2.5}
            sx={
              reducedMotion || isIntroDone
                ? undefined
                : {
                    '& > *': { animation: `${riseIn} 500ms ${MOTION.easeOut} both` },
                    ...staggeredRows,
                  }
            }
          >
            <Stack spacing={1} alignItems="center" textAlign="center">
              <Typography variant="h3" component="h2">
                Welcome
              </Typography>
              <Typography color="text.secondary">
                Enter your name and the family passphrase to view our registry.
              </Typography>
            </Stack>

            {error && (
              <Alert severity={error.status === 429 ? 'warning' : 'error'}>
                {getErrorMessage(error, "Couldn't check the passphrase. Please try again.")}
              </Alert>
            )}

            <Controller
              name="name"
              control={control}
              rules={{
                validate: (value) => {
                  const name = value.trim();
                  if (!name) return 'Please enter your name';
                  if (name.length > 60) return 'Please keep your name under 60 characters';
                  return NAME_PATTERN.test(name) || 'Please use letters only';
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Your name"
                  autoComplete="name"
                  autoFocus
                  error={Boolean(errors.name)}
                  helperText={
                    errors.name?.message ?? 'Shown to the parents when you mark a gift as bought.'
                  }
                />
              )}
            />

            <Controller
              name="passphrase"
              control={control}
              rules={{
                validate: (value) => value.trim().length > 0 || 'Please enter the passphrase',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Passphrase"
                  type={showPassphrase ? 'text' : 'password'}
                  autoComplete="current-password"
                  error={Boolean(errors.passphrase)}
                  helperText={errors.passphrase?.message}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassphrase((shown) => !shown)}
                            aria-label={showPassphrase ? 'Hide passphrase' : 'Show passphrase'}
                            edge="end"
                          >
                            {showPassphrase ? (
                              <VisibilityOffOutlinedIcon />
                            ) : (
                              <VisibilityOutlinedIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            <Button type="submit" variant="contained" size="large" disabled={isBusy} fullWidth>
              {isBusy ? 'Checking…' : 'Enter registry'}
            </Button>
          </Stack>
        </form>
      </Card>
    </AuthPageShell>
  );
};

export default WelcomePage;
