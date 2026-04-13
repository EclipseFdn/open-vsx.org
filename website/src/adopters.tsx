/******************************************************************************
 * Copyright (c) 2026 Contributors to the Eclipse Foundation.
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *****************************************************************************/

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled, Theme } from '@mui/material/styles';
import AdoptersList from './components/adopters-list';

const Heading = styled(Typography)(({ theme }: { theme: Theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2)
}));

const Adopters = () => {
  return (
    <Container maxWidth='md'>
      <Heading variant='h4'>Adopters</Heading>
      <Typography>
        Our open source projects drive innovation across a broad spectrum of industries and on both private and public
        clouds — enabling organizations of all shapes and sizes to accelerate cloud native development with world-class
        tools.
      </Typography>
      <Box mt={4} textAlign='center'>
        <Button variant='contained' color='secondary' href='https://ecdtools.eclipse.org/adopters/get-listed/'>
          Get Listed
        </Button>
      </Box>
      <AdoptersList />
    </Container>
  );
};

export default Adopters;
