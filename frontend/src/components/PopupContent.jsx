import React, { useState } from 'react';

export const PopupContent = ({ uploadImage }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      <input
        type="file"
        onChange={(event) => {
          setSelectedImage(event.target.files[0]);
          uploadImage(event.target.files[0]);
        }}
      />
      {selectedImage && <img src={URL.createObjectURL(selectedImage)} />}
    </>
  );
};
