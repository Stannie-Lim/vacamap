import React from 'react';

import { Typography, Grid } from '@mui/material';

export const ControlPanel = ({ selectedCountry }) => {
  const images = [
    'https://news.harvard.edu/wp-content/uploads/2014/10/hello-kitty-wallpaper-37_605.jpg',
    'https://www.akc.org/wp-content/uploads/2017/11/Yorkshire-Terrier-standing-outdoors-on-a-sunny-day.jpg'
  ];

  return (
    <Grid container style={{
      position: 'absolute',
      top: '0',
      right: '0',
      maxWidth: '320px',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      padding: '12px 24px',
      margin: '20px',
      fontSize: '13px',
      lineHeight: '2',
      color: '#6b6b76',
      outline: 'none',
      fontFamily: 'verdana',
    }}>
      <Grid item>
        <Typography>{selectedCountry}</Typography>
      </Grid>
      <Grid container item>
        {images.map(image => (
          <Grid item xs={12} key={image}>
            <img src={image} width="100%" />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};
