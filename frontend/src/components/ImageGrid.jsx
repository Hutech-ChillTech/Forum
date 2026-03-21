import React from 'react';

const ImageGrid = ({ images }) => {
    if (!images || images.length === 0) return null;

    if (images.length === 1) {
        return (
            <div className="media-preview" style={{ margin: '15px 0' }}>
                <img src={images[0]} alt="Post preview" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '12px' }} />
            </div>
        );
    }

    if (images.length === 2) {
        return (
            <div className="media-preview" style={{ margin: '15px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={images[0]} alt="Post preview 1" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                <img src={images[1]} alt="Post preview 2" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
            </div>
        );
    }

    if (images.length === 3) {
        return (
            <div className="media-preview" style={{ margin: '15px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={images[0]} alt="Post preview 1" style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '8px' }}>
                    <img src={images[1]} alt="Post preview 2" style={{ width: '100%', height: '171px', objectFit: 'cover' }} />
                    <img src={images[2]} alt="Post preview 3" style={{ width: '100%', height: '171px', objectFit: 'cover' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="media-preview" style={{ margin: '15px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderRadius: '12px', overflow: 'hidden' }}>
            <img src={images[0]} alt="Post preview 1" style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '8px' }}>
                <img src={images[1]} alt="Post preview 2" style={{ width: '100%', height: '171px', objectFit: 'cover' }} />
                <img src={images[2]} alt="Post preview 3" style={{ width: '100%', height: '171px', objectFit: 'cover' }} />
                <img src={images[3]} alt="Post preview 4" style={{ width: '100%', height: '171px', objectFit: 'cover' }} />
                {images.length > 4 ? (
                    <div style={{ position: 'relative', width: '100%', height: '171px' }}>
                        <img src={images[4]} alt="Post preview 5" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: 'bold' }}>
                            +{images.length - 4}
                        </div>
                    </div>
                ) : (
                    <img src={images[3]} alt="Post preview 4" style={{ width: '100%', height: '171px', objectFit: 'cover' }} />
                )}
            </div>
        </div>
    );
};

export default ImageGrid;
