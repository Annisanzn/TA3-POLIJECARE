import React from 'react';

const AppMinimal = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#E6E6FA', marginBottom: '20px' }}>PolijeCare - Test Page</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Halaman test untuk memastikan React berfungsi.</p>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Status System:</h2>
        <ul style={{ color: '#666', lineHeight: '1.6' }}>
          <li>✅ React berjalan</li>
          <li>✅ CSS terload</li>
          <li>✅ Tidak ada black screen</li>
        </ul>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#E6E6FA', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Test Login:</h2>
        <p style={{ color: '#666', marginBottom: '10px' }}>Akun test tersedia:</p>
        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px' }}>
          <strong>Mahasiswa:</strong> 2021001@student.polije.ac.id / password123<br/>
          <strong>Konselor:</strong> siti@polije.ac.id / password123<br/>
          <strong>Operator:</strong> budi@polije.ac.id / password123
        </div>
      </div>

      <button 
        onClick={() => alert('Test button berfungsi!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4C6EF5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default AppMinimal;
