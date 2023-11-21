import { useState } from 'react';
import { Button, Container, Grid, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup
  .object({
    email: yup.string().required('Email é obrigatório').email('Email inválido'),
    password: yup.string().required('Senha é obrigatória'),
  })
  .required();

export const Login = () => {
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    const { email, password } = data;
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      navigate('/menu');
      console.log(user, 'user');
    } catch (error) {
      console.error(error);
      setApiError('Erro ao fazer login. Verifique suas credenciais.');
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
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              type="password"
              label="Senha"
              variant="standard"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
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
                <Link to="#" style={{ textDecoration: 'none' }}>
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

        {apiError && (
          <Typography color="error" sx={{ textAlign: 'center', mt: 2 }}>
            {apiError}
          </Typography>
        )}
      </Grid>
    </Container>
  );
};
