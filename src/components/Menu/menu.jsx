/* eslint-disable react-hooks/rules-of-hooks */
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import Image1 from "../../../public/entrega-de-alimentos.png";
import Image2 from "../../../public/pizza.png";
import Image3 from "../../../public/hamburguer.png";
import Image4 from "../../../public/comida-mexicana.png";
import Image5 from "../../../public/refrigerantes.png";
import SearchIcon from "@mui/icons-material/Search";
import { useCart } from "../../context/useCarrinho";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import * as Yup from "yup";
import {
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import "./menu.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useFormat } from "./../../utils/useFormat";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

const schema = Yup.object().shape({
  refrigeranteDoCombo: Yup.string()
    .required("Escolha um refrigerante")
    .oneOf(["Pepsi 1L", "Guarana Antartica 1L"], "Escolha uma opção"),
});

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function Menu() {
  const navigate = useNavigate();
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

  const { mesa } = useParams();

  useEffect(() => {}, [mesa]);
  const [value, setValue] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  const [refrigeranteDoCombo, setrefrigeranteDoCombo] = useState("");
  const [isSegundoModalOpen, setIsSegundoModalOpen] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [activeTab, setActiveTab] = useState("combos");
  const [opcionais, setOpcionais] = useState([]);
  const [adicional, setAdicional] = useState([]);
  const [refrigeranteError, setRefrigeranteError] = useState("");
  const [bordaOptions, setBordaOptions] = useState([]);
  const { addToCart, cartState } = useCart();
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [firebaseData, setFirebaseData] = useState({});
  useEffect(() => {
    fetch(`https://testeapp-666bc-default-rtdb.firebaseio.com/.json`)
      .then((response) => response.json())
      .then((data) => {
        setFirebaseData(data);

        const bordaOptions = data.opcionais[activeTab] || [];
        setBordaOptions(bordaOptions);
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
      });
  }, [activeTab]);

  useEffect(() => {
    let objGenerico = [];
    if (
      firebaseData &&
      firebaseData.adicionais &&
      firebaseData.adicionais[activeTab]
    ) {
      firebaseData.adicionais[activeTab].forEach((adicional) =>
        objGenerico.push(adicional)
      );
    }

    setAdicional(objGenerico);
    setItemToAdd(null);
    setrefrigeranteDoCombo("");
    setOpcionais("");

    setObservacao("");
  }, [activeTab, firebaseData]);

  const handleIngredientIncrement = (ingredient) => {
    let copia = [...adicional];
    copia.forEach((item) => {
      if (item.name === ingredient) item.qtde += 1;
    });
    setAdicional(copia);
  };

  const handleIngredientDecrement = (ingredient) => {
    const adicionalSelected = adicional.filter(
      (item) => item.name === ingredient
    )[0];
    if (adicionalSelected.qtde > 0) {
      let copia = [...adicional];
      copia.forEach((item) => {
        if (item.name === ingredient) item.qtde -= 1;
      });
      setAdicional(copia);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsSegundoModalOpen(false);
  };

  const openConfirmationModal = (item, numeroDaMesaSelecionada) => {
    setItemToAdd(item);
    setrefrigeranteDoCombo("");
    setOpcionais("");
    setObservacao("");
    addToCart(item, mesa);
    adicionarItensAMesa(numeroDaMesaSelecionada);

    if (value === 0 && activeTab === "combos") {
      setIsModalOpen(true);
      setIsSegundoModalOpen(false);
    } else if (value !== 4 && activeTab !== "bebidas") {
      setIsModalOpen(false);
      setIsSegundoModalOpen(true);
    }
  };
  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleChange = (event, newValue) => {
    const tabClasses = [...event.target.classList];
    const optionClass = tabClasses
      .filter((item) => item.includes("opt"))[0]
      .substring(3);
    setValue(newValue);
    setActiveTab(optionClass);
  };

  window.onload = function () {
    sessionStorage.clear();
  };
  const adicionarItensAMesa = async (numeroDaMesaSelecionada) => {
    setObservacao(observacao);

    if (numeroDaMesaSelecionada) {
      const mesaCollectionRef = collection(
        firestore,
        `PEDIDOS MESAS/MESA ${numeroDaMesaSelecionada}/STATUS`
      );

      const nomeDoItemAdicionado =
        cartState.items.length > 0
          ? cartState.items[cartState.items.length - 1].item.sabor
          : null;
      setIsSnackbarOpen(true);
      setSnackbarMessage(
        `${nomeDoItemAdicionado} foi adicionado à comanda com sucesso!`
      );
      const consulta = query(
        mesaCollectionRef,
        orderBy("idPedido", "desc"),
        limit(1)
      );

      const resultadoConsulta = await getDocs(consulta);
      let idDoPedido = null;

      if (resultadoConsulta.size > 0) {
        const documentoExistente = resultadoConsulta.docs[0];
        idDoPedido = documentoExistente.data().idPedido;
        const adicionalSelected = adicional.filter((item) => item.qtde > 0);
        const valorOpcional = parseFloat(opcionais.split("_")[1]);

        const opcionalSelecionado = opcionais.split("_")[0];

        const novosItem = {
          ...itemToAdd,
          refrigeranteDoCombo: refrigeranteDoCombo || "",
          opcionais: opcionalSelecionado || "",
          Valoropcional: valorOpcional || "",
          adicional: adicionalSelected || "",
          observacao: observacao || "",
        };

        await updateDoc(documentoExistente.ref, {
          Pedido: [...documentoExistente.data().Pedido, novosItem],
        });
      } else {
        const dataAtual = new Date();
        idDoPedido = `${dataAtual.getDate()}${
          dataAtual.getMonth() + 1
        }${dataAtual.getFullYear()}${dataAtual.getHours()}${dataAtual.getMinutes()}${dataAtual.getSeconds()}`;
        const adicionalSelected = adicional.filter((item) => item.qtde > 0);

        const valorOpcional = parseFloat(opcionais.split("_")[1]);

        const opcionalSelecionado = opcionais.split("_")[0];

        const novosItem = {
          ...itemToAdd,
          refrigeranteDoCombo: refrigeranteDoCombo || "",
          opcionais: opcionalSelecionado || "",
          Valoropcional: valorOpcional || "",
          adicional: adicionalSelected || "",
          observacao: observacao || "",
        };

        await addDoc(mesaCollectionRef, {
          data: dataAtual,
          idPedido: idDoPedido,
          Pedido: [novosItem],
        });
      }
    }
  };

  return (
    <>
      <Button
        className="click box-shadow"
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          width: "90%",
          mt: 1,
          backgroundColor: "#f76d26",
          color: "#f7e9e1",
          zIndex: "4",
          "&:hover": {
            backgroundColor: "#f76d26",
          },
        }}
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon />
        Voltar a pagina das mesas
      </Button>
      <Tabs
        id="sectionsmenu"
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        aria-label="scrollable force tabs example"
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
          height: "8rem",
          minHeight: "5.9rem",
          width: "100%",
        }}
      >
        <Tab
          className="tabs optcombos"
          label="Combos"
          icon={<img src={Image1} alt="ImgCombo" />}
        />
        <Tab
          label="Pizza"
          className="tabs optpizza"
          icon={<img src={Image2} alt="ImgPizza" />}
        />
        <Tab
          label="Hamburguer"
          className="tabs opthamburguer"
          icon={<img src={Image3} alt="ImgHamburguer" />}
        />
        <Tab
          label="Pão Arabe"
          className="tabs optpaoArabe"
          icon={<img src={Image4} alt="ImgPaoArabe" />}
        />
        <Tab
          label="bebidas"
          className="tabs optbebidas"
          icon={<img src={Image5} alt="ImgBebidas" />}
        />
      </Tabs>

      <Box
        id="boxInput"
        className="boxInputMenu"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "95%",
          maxWidth: "574px",
          background: "#f9e9df",
          position: "relative",
          zIndex: "3",
          top: "0",
          borderRadius: "15px",
        }}
      >
        <SearchIcon className="iconSearchFilterMenu" />
        <TextField
          label="Procurar Item"
          variant="outlined"
          onChange={handleSearchInputChange}
        />
      </Box>

      <Box
        id="contentmenu"
        sx={{
          width: "100%",
          borderRadius: "35px 35px 0 0",
          height: "90%",
          overflow: "hidden",
          marginTop: "0.2rem",
        }}
      >
        <CustomTabPanel
          sx={{
            position: "absolute",
            height: "100%",
            minHeight: "340px",
            width: "100%",
            minWidth: "320px",
            overflow: "auto",
            zIndex: "1",
            padding: "2rem 15px 16rem",
          }}
          value={value}
          index={0}
        >
          {firebaseData.combos &&
            Object.values(firebaseData.combos)
              .filter((item) =>
                item.sabor.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((item) => (
                <Card key={item.id} className="cardMenu">
                  <CardContent className="cardContent">
                    <img src={item.imagem} alt="" />
                    <Box className="descriptionCard">
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6" sx={{ width: "100%" }}>
                          {item.sabor}
                        </Typography>
                      </Box>
                      <Typography>{item.ingredientes}</Typography>
                      <Box className="priceAndIcons">
                        <Typography variant="h6">
                          {useFormat(item.valor)}
                        </Typography>
                        <AddShoppingCartIcon
                          className="iconAddProduct click"
                          onClick={() => openConfirmationModal(item)}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
        </CustomTabPanel>

        <CustomTabPanel
          value={value}
          index={1}
          sx={{
            position: "absolute",
            height: "100%",
            minHeight: "340px",
            width: "100%",
            minWidth: "320px",
            overflow: "auto",
            zIndex: "1",
            padding: "2rem 15px 16rem",
          }}
        >
          {firebaseData.pizzas &&
            Object.values(firebaseData.pizzas)
              .filter((item) =>
                item.sabor.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((item) => (
                <Card key={item.id} className="cardMenu">
                  <CardContent className="cardContent">
                    <img src={item.imagem} alt="" />
                    <Box className="descriptionCard">
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6" sx={{ width: "100%" }}>
                          {item.sabor}
                        </Typography>
                      </Box>
                      <Typography>{item.ingredientes}</Typography>
                      <Box className="priceAndIcons">
                        <Typography variant="h6">
                          {useFormat(item.valor)}
                        </Typography>
                        <AddShoppingCartIcon
                          className="iconAddProduct click"
                          onClick={() => openConfirmationModal(item)}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
        </CustomTabPanel>

        <CustomTabPanel
          value={value}
          index={2}
          sx={{
            position: "absolute",

            height: "100%",
            minHeight: "340px",
            width: "100%",
            minWidth: "320px",
            overflow: "auto",
            zIndex: "1",
            padding: "2rem 15px 16rem",
          }}
        >
          {firebaseData.hamburger &&
            Object.values(firebaseData.hamburger)
              .filter((item) =>
                item.sabor.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((item) => (
                <Card key={item.id} className="cardMenu">
                  <CardContent className="cardContent">
                    <img src={item.imagem} alt="" />
                    <Box className="descriptionCard">
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6" sx={{ width: "100%" }}>
                          {item.sabor}
                        </Typography>
                      </Box>
                      <Typography>{item.ingredientes}</Typography>
                      <Box className="priceAndIcons">
                        <Typography variant="h6">
                          {useFormat(item.valor)}
                        </Typography>
                        <AddShoppingCartIcon
                          className="iconAddProduct click"
                          onClick={() => openConfirmationModal(item)}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
        </CustomTabPanel>

        <CustomTabPanel
          value={value}
          index={3}
          sx={{
            position: "absolute",

            height: "100%",
            minHeight: "340px",
            width: "100%",
            minWidth: "320px",
            overflow: "auto",
            zIndex: "1",
            padding: "2rem 15px 16rem",
          }}
        >
          {firebaseData.paoArabe &&
            Object.values(firebaseData.paoArabe)
              .filter((item) =>
                item.sabor.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((item) => (
                <Card key={item.id} className="cardMenu">
                  <CardContent className="cardContent">
                    <img src={item.imagem} alt="" />
                    <Box className="descriptionCard">
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6" sx={{ width: "100%" }}>
                          {item.sabor}
                        </Typography>
                      </Box>
                      <Typography>{item.ingredientes}</Typography>
                      <Box className="priceAndIcons">
                        <Typography variant="h6">
                          {useFormat(item.valor)}
                        </Typography>
                        <AddShoppingCartIcon
                          className="iconAddProduct click"
                          onClick={() => {
                            openConfirmationModal(item);
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
        </CustomTabPanel>

        <CustomTabPanel
          value={value}
          index={4}
          sx={{
            position: "absolute",

            height: "100%",
            minHeight: "340px",
            width: "100%",
            minWidth: "320px",
            overflow: "auto",
            zIndex: "1",
            padding: "2rem 15px 16rem",
          }}
        >
          {firebaseData.drinks &&
            Object.values(firebaseData.drinks)
              .filter((item) =>
                item.sabor.toLowerCase().includes(searchValue.toLowerCase())
              )
              .map((item) => (
                <Card key={item.id} className="cardMenu">
                  <CardContent className="cardContent">
                    <img src={item.imagem} alt="" />
                    <Box className="descriptionCard">
                      <Box
                        sx={{
                          display: "flex",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="h6" sx={{ width: "100%" }}>
                          {item.sabor}
                        </Typography>
                      </Box>
                      <Typography>{item.ingredientes}</Typography>
                      <Box className="priceAndIcons">
                        <Typography variant="h6">
                          {useFormat(item.valor)}
                        </Typography>
                        <AddShoppingCartIcon
                          className="iconAddProduct click"
                          onClick={() => {
                            adicionarItensAMesa(item);
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
        </CustomTabPanel>
        <Snackbar
          sx={{ position: "absolute", bottom: "2rem", zIndex: "1400" }}
          open={isSnackbarOpen}
          autoHideDuration={3000}
          onClose={() => setIsSnackbarOpen(false)}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={() => setIsSnackbarOpen(false)}
            severity="success"
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Box>

      {/*---- Fazendo isso para separar o modal pra nao confundir( a partir daqui tem dois modais)*/}

      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setrefrigeranteDoCombo("");
          setRefrigeranteError("");
        }}
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
      >
        <Box
          sx={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-evenly",
            backgroundColor: "#fae9de",
            position: " absolute",
            top: " 50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: " 90%",
            maxWidth: "600px",
            height: "15rem",
            minHeight: " 100px",
            border: "6px solid #e5c7b3",
            borderRadius: " 30px",
            boxShadow: "5px 4px 5px 2px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Typography variant="h6" id="confirmation-modal-title"></Typography>
          {itemToAdd && (
            <>
              <Typography variant="h6" id="confirmation-modal-title">
                Escolha o refrigerante
              </Typography>
              <RadioGroup
                sx={{
                  display: "flex",
                  height: "40%",
                  justifyContent: "space-around",
                }}
                aria-label="sabores"
                name="sabores"
                value={refrigeranteDoCombo}
                onChange={(e) => {
                  setrefrigeranteDoCombo(e.target.value);
                  setRefrigeranteError("");
                }}
              >
                <FormControlLabel
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    height: "1rem",
                  }}
                  value="Pepsi 1L"
                  control={<Radio />}
                  label="Pepsi 1L"
                />
                <FormControlLabel
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    height: "1rem",
                  }}
                  value="Guarana Antartica 1L"
                  control={<Radio />}
                  label="Guarana Antartica 1L"
                />
              </RadioGroup>
              <p style={{ color: "red", margin: "0.5rem 0" }}>
                {refrigeranteError}
              </p>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                <Button
                  className="click box-shadow"
                  sx={{
                    width: "30%",
                    backgroundColor: "#f76d26 ",
                    color: "#f7e9e1",
                    "&:hover": {
                      backgroundColor: "#f76d26",
                    },
                  }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Voltar
                </Button>
                <Button
                  className="click box-shadow"
                  sx={{
                    width: "30%",
                    backgroundColor: "#f76d26",
                    color: "#f7e9e1",
                    "&:hover": {
                      backgroundColor: "#f76d26",
                    },
                  }}
                  onClick={() => {
                    schema
                      .validate({ refrigeranteDoCombo })
                      .then(() => {
                        setIsSegundoModalOpen(true);
                        setRefrigeranteError("");
                      })
                      .catch((error) => {
                        setRefrigeranteError(error.message);
                      });
                  }}
                >
                  Avançar
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/*Segundo modal */}
      <Modal
        open={isSegundoModalOpen}
        onClose={() => setIsSegundoModalOpen(true)}
        aria-labelledby="segundo-modal-title"
        aria-describedby="segundo-modal-description"
      >
        <Box
          sx={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-evenly",
            backgroundColor: "#fae9de",
            position: " absolute",
            top: " 50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: " 90%",
            maxWidth: "600px",
            height: "70%",
            minHeight: "32rem",
            border: "6px solid #e5c7b3",
            borderRadius: " 30px",
            boxShadow: "5px 4px 5px 2px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Typography
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            variant="h6"
            id="segundo-modal-title"
          >
            Deseja acrescentar algo?
          </Typography>

          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: "bold",
              paddingLeft: "0.8rem",
            }}
          >
            Adicionar ingredientes:
          </Typography>
          {adicional.map((obj, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingLeft: "0.8rem",
                }}
              >
                <Typography>
                  {obj.name} <Box>{useFormat(obj.valor)}</Box>
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    width: "37%",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Button
                    sx={{ color: "black" }}
                    onClick={() => handleIngredientDecrement(obj.name)}
                  >
                    -
                  </Button>
                  <Typography>{obj.qtde}</Typography>
                  <Button
                    sx={{ color: "black" }}
                    onClick={() => handleIngredientIncrement(obj.name)}
                  >
                    +
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}

          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: "bold",
              paddingLeft: "0.8rem",
            }}
          >
            Selecionar Opcionais:
          </Typography>

          <RadioGroup
            sx={{
              display: "flex",
              gap: "1.2rem",
              justifyContent: "space-around",
              width: "100%",
              paddingLeft: "0.8rem",
            }}
            aria-label="borda"
            name="borda"
            value={opcionais}
            onChange={(e) => {
              setOpcionais(e.target.value);
              setRefrigeranteError("");
            }}
          >
            {bordaOptions.map((bordaOption, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: "1rem",
                }}
              >
                <FormControlLabel
                  value={`${bordaOption.opcao}_${bordaOption.valorAdc}`}
                  control={<Radio />}
                  label={bordaOption.opcao}
                />
                <Typography sx={{ paddingRight: "5%" }}>
                  {useFormat(bordaOption.valorAdc)}
                </Typography>
              </Box>
            ))}
          </RadioGroup>

          <Box style={{ color: "red" }}>{refrigeranteError}</Box>
          <TextField
            sx={{
              width: "100%",
              display: "flex",
              height: "15%",
              justifyContent: "center",
              alignItems: "center",
              "& div:first-of-type": {
                width: "95%",
              },
            }}
            placeholder="Observação ex: tirar cebola, verdura."
            variant="outlined"
            fullWidth
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />

          <Box
            sx={{
              height: "3rem",
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-evenly",
            }}
          >
            <Button
              className="click box-shadow"
              sx={{
                height: "100%",
                width: "30%",
                backgroundColor: "#f76d26 ",
                color: "#f7e9e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  backgroundColor: "#f76d26",
                },
              }}
              onClick={() => setIsSegundoModalOpen(false)}
            >
              Voltar
            </Button>
            <Button
              className="click box-shadow"
              sx={{
                height: "100%",
                width: "50%",
                backgroundColor: "#f76d26",
                color: "#f7e9e1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  backgroundColor: "#f76d26",
                },
              }}
              onClick={() => {
                if (!opcionais) {
                  setRefrigeranteError("Escolha um opcional");
                } else {
                  setRefrigeranteError("");
                  adicionarItensAMesa(mesa);
                  handleModalClose();
                }
              }}
            >
              Adicionar a comanda
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
