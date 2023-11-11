/* eslint-disable no-unused-vars */
import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup
  .object({
    email: yup.string().required().email(),
    password: yup.string().required(),
  })
  .required();

export const Login = () => {
  // const {
  //   handleSignIn,
  //   email,
  //   setEmail,
  //   password,
  //   setPassword,
  // } = useLogin;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const onSubmit = async () => {
    const auth = getAuth();
    try {
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
      const user = userCredential.user;
      navigate('/menu');
      console.log(user, 'user');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container sx={{ backgroundColor: '#fff' }}>
      <Grid container sx={{ p: '40% 0 0 0' }}>
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#f46c26',
              fontSize: '22px',
              fontWeight: 600,
            }}
          >
            Painel Atendente
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{
            height: '100px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#f46c26',
              fontSize: '32px',
              fontWeight: 600,
            }}
          >
            Login
          </Typography>
        </Grid>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid
            item
            xs={12}
            sx={{
              display: 'grid',
              gap: '50px',
              p: '0 20px 0 20px',
            }}
          >
            <TextField
              type="email"
              label="Email"
              variant="standard"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              {...register('email')}
            />
            <p>{errors.email?.message}</p>
            <TextField
              type="password"
              label="Senha"
              variant="standard"
              onChange={(e) => setPassword(e.target.value)}
              {...register('password')}
            />
            <p>{errors.password?.message}</p>
          </Grid>
          <Grid
            container
            width="100%"
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: '10px',
            }}
          >
            <Grid item xs={6}>
              <Typography
                sx={{
                  textAlign: 'center',
                }}
              >
                <Link style={{ textDecoration: 'none' }}>
                  Esqueceu a senha?
                </Link>
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: '50px',
              }}
            >
              <Button
                type="submit"
                variant="contained"
                sx={{
                  width: '200px',
                  height: '50px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                Entrar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Container>
  );
};
