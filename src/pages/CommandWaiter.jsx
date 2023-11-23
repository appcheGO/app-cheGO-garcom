/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  query,
  limit,
  updateDoc,
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
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddIcon from "@mui/icons-material/Add";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCarrinho";
import { orderBy } from "lodash";
import { useFormat } from "../utils/useFormat";

const firebaseConfig = {
  apiKey: "AIzaSyCtUEJucj4FgNrJgwLhcpzZ7OJVCqjM8ls",
  authDomain: "testeapp-666bc.firebaseapp.com",
  projectId: "testeapp-666bc",
  storageBucket: "testeapp-666bc.appspot.com",
  messagingSenderId: "273940847816",
  appId: "1:273940847816:web:7d5c1f136cb8cac3c159fd",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

function CommandWaiter() {
  const [mesaStatus, setMesaStatus] = useState({});
  const [numMesas, setNumMesas] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const { cartState, dispatch } = useCart();
  const [selectedTable, setSelectedTable] = useState(null);
  const [showPedidoDetailsModal, setShowPedidoDetailsModal] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNumMesas = async () => {
      const mesasCollectionRef = collection(firestore, "PEDIDOS MESAS");
      const mesasSnapshot = await getDocs(mesasCollectionRef);
      setNumMesas(mesasSnapshot.size);
    };

    fetchNumMesas();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  const fetchMesaStatus = async (mesa) => {
    const mesaDocRef = doc(firestore, "PEDIDOS MESAS", `MESA ${mesa}`);
    const mesaDocSnap = await getDoc(mesaDocRef);

    if (mesaDocSnap.exists()) {
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
  const handleOpenModalListaItens = async (table) => {
    setSelectedTable(table);

    const mesaCollectionRef = collection(
      firestore,
      `PEDIDOS MESAS/MESA ${table}/STATUS`
    );

    const consulta = query(mesaCollectionRef, orderBy("idPedido", "asc"));
    const resultadoConsulta = await getDocs(consulta);

    if (resultadoConsulta.size > 0) {
      const documentoExistente = resultadoConsulta.docs[0];
      const pedidoData = documentoExistente.data();
      setSelectedPedido(pedidoData);
      setShowPedidoDetailsModal(true);
    } else {
      console.log("Não foram encontrados pedidos para esta mesa.");
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
    if (selectedTable) {
      const mesaCollectionRef = collection(
        firestore,
        `PEDIDOS MESAS/MESA ${selectedTable}/STATUS`
      );

      const consulta = query(
        mesaCollectionRef,
        orderBy("idPedido", "desc"),
        limit(1)
      );
      const resultadoConsulta = await getDocs(consulta);

      let idDoPedido;

      if (resultadoConsulta.size > 0) {
        const documentoExistente = resultadoConsulta.docs[0];
        idDoPedido = documentoExistente.data().idPedido;

        await updateDoc(documentoExistente.ref, {
          Pedido: [...documentoExistente.data().Pedido, ...cartState.items],
        });
      } else {
        const dataAtual = new Date();
        idDoPedido = `${dataAtual.getDate()}${
          dataAtual.getMonth() + 1
        }${dataAtual.getFullYear()}${dataAtual.getHours()}${dataAtual.getMinutes()}${dataAtual.getSeconds()}`;

        await addDoc(mesaCollectionRef, {
          idPedido: idDoPedido,
          Pedido: cartState.items,
        });
      }

      dispatch({ type: "CLEAR_CART" });

      navigate(`/cardapio/${selectedTable}`);
    }
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
        <Container
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <Typography variant="h6">Bem vindo</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateStatus}
          >
            Atualizar Status
          </Button>
        </Container>
      </AppBar>
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "120px",
          padding: "1rem",
        }}
      >
        <Grid item xs={12}></Grid>
        {Array.from({ length: numMesas }, (_, index) => index + 1).map(
          (mesa) => (
            <Grid key={mesa} item xs={6} sm={4} md={3} lg={2}>
              <Card
                sx={{
                  width: "100%",
                  height: "150px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: "10px",
                  textDecoration: "none",
                  color: "white",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  backgroundColor:
                    mesaStatus[mesa] === "LIVRE" ? "green" : "red",
                }}
              >
                <Typography variant="h6">{`Mesa ${mesa}`}</Typography>
                <Box
                  sx={{
                    width: "20%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {mesaStatus[mesa] === "OCUPADA" && (
                    <FormatListBulletedIcon
                      titleAccess="itens do pedido"
                      label="itens do pedido"
                      sx={{
                        width: "100%",
                        height: "50%",
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenModalListaItens(mesa)}
                    />
                  )}
                  <AddIcon
                    titleAccess="Adicionar itens ao pedido"
                    label="Adicionar itens ao pedido"
                    sx={{
                      width: "100%",
                      height: "50%",
                      cursor: "pointer",
                    }}
                    onClick={() => handleOpenModal(mesa)}
                  />
                </Box>
              </Card>
            </Grid>
          )
        )}
      </Grid>

      <Modal
        open={showPedidoDetailsModal}
        onClose={() => setShowPedidoDetailsModal(false)}
      >
        <Box
          sx={{
            overflow: "auto",
            height: "90%",
            width: "90%",
            maxWidth: "700px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="div">
            Detalhes do Pedido
            <p>Mesa: {selectedTable}</p>
            {selectedPedido && (
              <div>
                <Typography variant="subtitle1">
                  ID do Pedido: {selectedPedido.idPedido}
                </Typography>

                {selectedPedido && selectedPedido.Pedido && (
                  <div>
                    {selectedPedido.Pedido.map((pedidoItem, index) => (
                      <div key={index}>
                        <p>Sabor: {pedidoItem.item.sabor}</p>
                        <p>ID do Item: {pedidoItem.item.id}</p>
                        <p>Ingredientes: {pedidoItem.item.ingredientes}</p>
                        <p>Valor: {useFormat(pedidoItem.item.valor)}</p>
                        <p>
                          Valor Opcional: {useFormat(pedidoItem.Valoropcional)}
                        </p>
                        <p>Observação: {pedidoItem.observacao}</p>
                        <p>Opcionais: {pedidoItem.opcionais}</p>
                        <p>
                          Refrigerante do Combo:
                          {pedidoItem.refrigeranteDoCombo}
                        </p>

                        <p>Itens Adicionais:</p>
                        {pedidoItem.adicional && (
                          <ul>
                            {pedidoItem.adicional.map(
                              (adicionalItem, adicionalIndex) => (
                                <li
                                  style={{ listStyle: "none" }}
                                  key={adicionalIndex}
                                >
                                  {adicionalItem.name}-({adicionalItem.qtde}x)-
                                  {useFormat(adicionalItem.valor)}
                                </li>
                              )
                            )}
                          </ul>
                        )}

                        <hr />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowPedidoDetailsModal(false)}
            sx={{ mt: 2 }}
          >
            Fechar
          </Button>
        </Box>
      </Modal>

      <Modal open={showModal} onClose={handleCloseModal}>
        <Box
          sx={{
            width: "90%",
            maxWidth: "700px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",

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
