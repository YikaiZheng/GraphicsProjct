import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { grey } from '@mui/material/colors';
import {Grid, Box} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { shadows } from '@mui/system';
import Stack from '@mui/material/Stack';
const { palette } = createTheme();
const { augmentColor } = palette;
const createColor = (mainColor) => augmentColor({ color: { main: mainColor } });
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
const theme = createTheme({
  palette: {
    grey: createColor('#37474f'),
  },
});

export default function Menu(){
    const navigate = useNavigate();
    return(
        <div className = "background">
            <ThemeProvider theme={theme}>
            <Stack sx={{ width: '100%', height:'90%', color: 'grey.500' }} spacing={40}>
            <Stack sx={{ width: '100%', height:'80%', color: 'grey.500' }} spacing={-40}>
            <img src='/title1.png'/>
            <Grid container spacing={0} className='grid'>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ maxWidth: 400 ,boxShadow:10}}>
                <CardMedia
                    sx={{ height: 300 }}
                    image="/level1img.png"
                />
                <div className='card_bg1'>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                        第一关
                        </Typography>
                        <Box sx = {{columnGap: 4}}>
                            <Typography variant="body2" sx={{ color: 'text.secondary'}}>
                            交汇
                            </Typography>
                        </Box>       
                    </CardContent>
                    <CardActions>
                        <Button color='grey' variant='contained' size="small" onClick={()=>navigate('/level1')}>进入</Button>
                    </CardActions>
                </div>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ maxWidth: 400 , boxShadow:10}}>
                <CardMedia
                    sx={{ height: 300 }}
                    image="/level2img.png"
                />
                <div className='card_bg2'>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                    第二关
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    奥德赛
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button color='grey' variant='contained' size="small" onClick={()=>navigate('/level2')}>进入</Button>
                </CardActions>
                </div>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ maxWidth: 400 , boxShadow:10}}>
                <CardMedia
                    sx={{ height: 300 }}
                    image="/level2img.png"
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                    第三关
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    未尽
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button color='grey' variant='contained' size="small" onClick={()=>navigate('/level3')}>进入</Button>
                </CardActions>
                </Card>
            </Grid>
            </Grid>
            </Stack>
            <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            >
            <Button fullWidth={false} color='grey' variant = 'contained' size='large' startIcon={<ArrowBackIcon/>} onClick={()=>navigate('/')}>返回主页</Button>
            </Box>
            </Stack>
            </ThemeProvider>
        </div>
    )
}