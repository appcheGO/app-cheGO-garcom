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
      let dataHoraPedido;

      if (resultadoConsulta.size > 0) {
        const documentoExistente = resultadoConsulta.docs[0];
        idDoPedido = documentoExistente.data().idPedido;
        dataHoraPedido = new Date().toLocaleString();

        await updateDoc(documentoExistente.ref, {
          Pedido: [
            ...documentoExistente.data().Pedido,
            {
              ...cartState.items,
              quantidadeDePessoasNaMesa: peopleCount,
            },
          ],
          dataHoraPedido: dataHoraPedido,
        });
      } else {
        const dataAtual = new Date();
        idDoPedido = `${dataAtual.getDate()}${
          dataAtual.getMonth() + 1
        }${dataAtual.getFullYear()}${dataAtual.getHours()}${dataAtual.getMinutes()}${dataAtual.getSeconds()}`;

        dataHoraPedido = dataAtual.toLocaleString();
        currentUser.email;
        await addDoc(mesaCollectionRef, {
          idPedido: idDoPedido,
          Pedido: [
            {
              ...cartState.items,
            },
          ],
          quantidadeDePessoasNaMesa: peopleCount,
          dataHoraPedido: dataHoraPedido,
          UsuarioQueIniciouOPedido: currentUser.email,
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
            Atualizar Mesas
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
                      sx={{
                        width: "100%",
                        height: "50%",
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenModalListaItens(mesa)}
                    />
                  )}
                  <AddIcon
                    titleAccess="Adicionar pedido a mesa"
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
          {selectedPedido && (
            <Typography variant="subtitle2">
              <Typography variant="h6">Detalhes da comanda</Typography>
              <Typography variant="h6">Mesa: {selectedTable}</Typography>
              <Typography variant="h6">
                Comanda: {selectedPedido.idPedido}
              </Typography>
              <Typography variant="h6">
                Pedido Iniciado : {selectedPedido.dataHoraPedido}
              </Typography>
              <hr />
              <Box>
                {selectedPedido && selectedPedido.Pedido && (
                  <Box>
                    {selectedPedido.Pedido.map((pedidoItem, index) => (
                      <Box key={index}>
                        <p>
                          Item:{" "}
                          <span style={{ fontWeight: "200" }}>
                            {pedidoItem.item.sabor}
                          </span>
                        </p>
                        {pedidoItem.refrigeranteDoCombo == "" ? (
                          <Box />
                        ) : (
                          <p>
                            Refrigerante do Combo:
                            <span style={{ fontWeight: "200" }}>
                              {pedidoItem.refrigeranteDoCombo}
                            </span>
                          </p>
                        )}

                        <p>
                          Valor:{" "}
                          <span style={{ fontWeight: "200" }}>
                            {useFormat(pedidoItem.item.valor)}
                          </span>
                        </p>
                        <p>
                          Opcional:{" "}
                          <span style={{ fontWeight: "200" }}>
                            {pedidoItem.opcionais}
                          </span>
                        </p>
                        {pedidoItem.Valoropcional == "" ||
                        pedidoItem.Valoropcional == 0 ? (
                          <p>
                            Valor Opcional:
                            <span style={{ fontWeight: "200" }}>Gratis</span>
                          </p>
                        ) : (
                          <p>
                            Valor Opcional:{" "}
                            <span style={{ fontWeight: "200" }}>
                              {useFormat(pedidoItem.Valoropcional)}
                            </span>
                          </p>
                        )}
                        {pedidoItem.adicional == 0 ? (
                          <Box />
                        ) : (
                          <p>Itens Adicionais:</p>
                        )}

                        {pedidoItem.adicional &&
                          pedidoItem.adicional.length > 0 && (
                            <ul>
                              {pedidoItem.adicional.map(
                                (adicionalItem, adicionalIndex) => (
                                  // eslint-disable-next-line react/jsx-key
                                  <span style={{ fontWeight: "200" }}>
                                    <li
                                      style={{ listStyle: "none" }}
                                      key={adicionalIndex}
                                    >
                                      {adicionalItem.name}-({adicionalItem.qtde}
                                      x)-
                                      {useFormat(adicionalItem.valor)}
                                    </li>
                                  </span>
                                )
                              )}
                            </ul>
                          )}
                        {pedidoItem.observacao == "" ? (
                          <Box />
                        ) : (
                          <p>
                            Observação:{" "}
                            <span style={{ fontWeight: "200" }}>
                              {pedidoItem.observacao}
                            </span>
                          </p>
                        )}

                        <p>
                          Quantidade:{" "}
                          <span style={{ fontWeight: "200" }}>
                            {pedidoItem.item.quantidade}
                          </span>
                        </p>
                        <p>
                          Valor total do item:{" "}
                          <span style={{ fontWeight: "200" }}>
                            {useFormat(
                              Number(pedidoItem.item.valor) +
                                Number(pedidoItem.Valoropcional) +
                                (pedidoItem.adicional
                                  ? pedidoItem.adicional.reduce(
                                      (total, item) =>
                                        total + Number(item.valor),
                                      0
                                    )
                                  : 0)
                            )}
                          </span>
                        </p>

                        <hr />
                      </Box>
                    ))}
                    <Typography variant="h6">
                      Valor da comanda:{" "}
                      {useFormat(
                        selectedPedido.Pedido.reduce((total, pedidoItem) => {
                          return (
                            total +
                            Number(pedidoItem.item.valor) +
                            Number(pedidoItem.Valoropcional) +
                            (pedidoItem.adicional
                              ? pedidoItem.adicional.reduce(
                                  (subtotal, item) =>
                                    subtotal + Number(item.valor),
                                  0
                                )
                              : 0)
                          );
                        }, 0)
                      )}
                    </Typography>
                    <Typography variant="subtitle2">
                      Quantidade de Pessoas na mesa:{" "}
                      {selectedPedido.quantidadeDePessoasNaMesa}
                    </Typography>
                    <Typography variant="subtitle2">
                      Valor sugerido por pessoa:{" "}
                      {useFormat(
                        selectedPedido.Pedido.reduce((total, pedidoItem) => {
                          return (
                            (total +
                              Number(pedidoItem.item.valor) +
                              Number(pedidoItem.Valoropcional) +
                              (pedidoItem.adicional
                                ? pedidoItem.adicional.reduce(
                                    (subtotal, item) =>
                                      subtotal + Number(item.valor),
                                    0
                                  )
                                : 0)) /
                            selectedPedido.quantidadeDePessoasNaMesa
                          );
                        }, 0)
                      )}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Typography>
          )}

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
          <Typography variant="h6" component="Box">
            Adicionar Pedido
          </Typography>

          {currentUser && (
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Usuário : {currentUser.email}
            </Typography>
          )}
          {mesaStatus[selectedTable] === "LIVRE" && (
            <>
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
            </>
          )}
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
