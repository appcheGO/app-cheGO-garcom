import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import {
  AppBar,
  Card,
  Container,
  Grid,
  Typography,
  Button,
  Modal,
  Box,
  Select,
  MenuItem,
} from "@mui/material";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Inicialize o Firebase com a configuração do seu projeto
const firebaseConfig = {
  apiKey: "AIzaSyCtUEJucj4FgNrJgwLhcpzZ7OJVCqjM8ls",
  authDomain: "testeapp-666bc.firebaseapp.com",
  projectId: "testeapp-666bc",
  storageBucket: "testeapp-666bc.appspot.com",
  messagingSenderId: "273940847816",
  appId: "1:273940847816:web:7d5c1f136cb8cac3c159fd",
  // Sua configuração do Firebase aqui
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

function CommandWaiter() {
  const [mesaStatus, setMesaStatus] = useState({});
  const [numMesas, setNumMesas] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Use useEffect para buscar a quantidade de mesas quando o componente é montado
  useEffect(() => {
    const fetchNumMesas = async () => {
      const mesasCollectionRef = collection(firestore, "PEDIDOS MESAS");
      const mesasSnapshot = await getDocs(mesasCollectionRef);
      setNumMesas(mesasSnapshot.size);
    };

    fetchNumMesas();

    // Configurar o listener para mudanças no estado de autenticação
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Limpar o listener ao desmontar o componente
    return () => unsubscribe();
  }, []);

  const fetchMesaStatus = async (mesa) => {
    const mesaDocRef = doc(firestore, "PEDIDOS MESAS", `MESA ${mesa}`);
    const mesaDocSnap = await getDoc(mesaDocRef);

    if (mesaDocSnap.exists()) {
      // Verifique se a subcoleção "STATUS" tem algum documento
      const statusCollectionRef = collection(
        firestore,
        `PEDIDOS MESAS/MESA ${mesa}/STATUS`
      );
      const statusSnapshot = await getDocs(statusCollectionRef);

      if (statusSnapshot.empty) {
        setMesaStatus((prevStatus) => ({ ...prevStatus, [mesa]: "LIVRE" }));
      } else {
        setMesaStatus((prevStatus) => ({ ...prevStatus, [mesa]: "OCUPADA" }));
      }
    } else {
      setMesaStatus((prevStatus) => ({ ...prevStatus, [mesa]: "LIVRE" }));
    }
  };

  const handleUpdateStatus = () => {
    for (let mesa = 1; mesa <= numMesas; mesa++) {
      fetchMesaStatus(mesa);
    }
  };

  const handleOpenModal = (table) => {
    setSelectedTable(table);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
    setShowModal(false);
  };

  const handleInputChange = (event) => {
    setPeopleCount(Number(event.target.value));
  };

  const handleAddPedido = async () => {
    // Adicione lógica para enviar selectedItems para a coleção correspondente à mesa selecionada
    const mesaCollectionRef = collection(
      firestore,
      `PEDIDOS MESAS/MESA ${selectedTable}/STATUS/`
    );

    // Exemplo: Adicione os itens ao documento da mesa
    await addDoc(mesaCollectionRef, { itens: selectedItems });

    // Limpe os itens selecionados
    setSelectedItems([]);

    // Feche o modal
    handleCloseModal();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#f76d26",
          height: "108px",
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Container>
          <Typography>Bem vindo</Typography>
        </Container>
      </AppBar>
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "120px",
          padding: "1rem",
        }}
      >
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateStatus}
          >
            Atualizar Status
          </Button>
        </Grid>
        {Array.from({ length: numMesas }, (_, index) => index + 1).map(
          (mesa) => (
            <Grid key={mesa} item xs={6} sm={4} md={3} lg={2}>
              <Card
                onClick={() => handleOpenModal(mesa)}
                sx={{
                  width: "100%",
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: "10px",
                  textDecoration: "none",
                  color: "inherit",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor:
                    mesaStatus[mesa] === "LIVRE" ? "green" : "red",
                }}
              >
                <Typography variant="h6">{`Mesa ${mesa}`}</Typography>
              </Card>
            </Grid>
          )
        )}
      </Grid>

      {/* Modal */}
      <Modal open={showModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="div">
            Adicionar Pedido
          </Typography>
          {currentUser && (
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Usuário : {currentUser.email}
            </Typography>
          )}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Quantidade de pessoas:
          </Typography>
          <Select
            value={peopleCount}
            onChange={handleInputChange}
            fullWidth
            sx={{ mt: 2 }}
          >
            {[1, 2, 3, 4, 5].map((count) => (
              <MenuItem key={count} value={count}>
                {count}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddPedido}
            sx={{ mt: 2 }}
          >
            Adicionar Pedido
          </Button>
        </Box>
      </Modal>
    </>
  );
}

export default CommandWaiter;
