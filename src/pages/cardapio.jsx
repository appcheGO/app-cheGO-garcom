import { Box } from "@mui/material";

import Menu from "../components/Menu/menu";
const Cardapio = () => {
  return (
    <Box
      sx={{
        width: "100dvw",
        maxWidth: "600px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Menu />
    </Box>
  );
};

export default Cardapio;
