import React from "react";
import { Container, Typography, Box, Button } from "@mui/material";
import { styled, Theme } from '@mui/material/styles';
import AdoptersList from "./components/adopters-list";

const Heading = styled(Typography)(({ theme }: { theme: Theme }) => ({
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2)
}));

const Adopters = () => {
    return (
        <Container maxWidth='md'>
            <Heading variant='h4'>
                Adopters
            </Heading>
            <Typography>
            Our open source projects drive innovation across a broad spectrum of industries and on both private and public clouds — enabling organizations of all shapes and sizes to accelerate cloud native development with world-class tools.
            </Typography>
            <Box mt={4} textAlign='center'>
              <Button 
                  variant='contained' 
                  color='secondary' 
                  href='https://ecdtools.eclipse.org/adopters/get-listed/'
              >
                Get Listed
              </Button>
            </Box>
            <AdoptersList/>
        </Container>
   );
}

export default Adopters;
