
import { Link } from 'react-router-dom';
import {
  AppBar,
  Card,
  Container,
  Grid,
  Typography,
} from '@mui/material';

function CommandWaiter() {
  
  const mesas = Array.from({ length: 10 }, (_, index) => index + 1);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: '#f76d26',
          height: '108px',
          display: 'flex',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography>Bem vindo</Typography>
        </Container>
      </AppBar>
      <Grid
        container
        spacing={2}
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '120px', padding:"1rem" }}
      >
        {mesas.map((mesa) => (
          <Grid key={mesa} item xs={6} sm={4} md={3} lg={2}>
            <Card
              component={Link} 
              to={`/mesa/${mesa}`}
              sx={{
                width: '100%',
                height: '80px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: '10px',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #ccc',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <Typography variant="h6">{`Mesa ${mesa}`}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default CommandWaiter;
