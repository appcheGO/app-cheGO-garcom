import {
  AppBar,
  Card,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

function CommandWaiter() {
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
        sx={{ display: 'flex', justifyContent: 'center' }}
      >
        <Grid item xs={10}>
          <Card
            sx={{
              width: '100%',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              p: '10px',
            }}
          >
            <TextField
              variant="standard"
              label="Nome"
              fullWidth
            />
          </Card>
        </Grid>
        <Grid item xs={10}>
          <FormControl
            fullWidth
            sx={{ backgroundColor: '#fff' }}
          >
            <InputLabel id="demo-simple-select-label">
              Mesa
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={''}
              label="mesa"
              //   onChange={handleChange}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
              <MenuItem value={3}>3</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}

export default CommandWaiter;
