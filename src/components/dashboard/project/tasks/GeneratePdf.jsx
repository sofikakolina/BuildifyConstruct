import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { IconButton, Box } from "@mui/material";
// import { format } from 'date-fns';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto'
  },
  flexContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  flexContainerCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '40px',
  },
  logo: {
    width: 150,
    height: 42.92,
  },
  invoiceHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  invoiceInfo: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
  companyInfo: {
    fontSize: 12,
    color: '#333',
    marginBottom: 10,
  },
  companyHeader: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clientInfo: {
    marginBottom: 10,
  },

  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '50%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 8, 
    fontSize: 14,
  },
  tableCol: {
    width: '50%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  tableCell: {
    fontSize: 10,
  },
  tableCellName: {
    fontSize: 10,
    marginBottom: 10,
  },
  tableColSizes: {
    width: '50%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 12,
    flexDirection: 'column' // Отображаем текст в столбце по вертикали
  },
  tableCellName: {
    marginBottom: 5, // Добавим отступ после имени
    fontSize: 10,
  },
  tableCellSize: {
    fontSize: 10,
    color: '#666', // Сделаем размеры немного серыми для отличия от имени
  },
  tableCellMaterial: {
    fontSize: 8,
    color: '#666',
  },
  totals: {
    margin: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    fontSize: 12,
  },
  image: {
    height: "auto",
    width: '100%',
    objectFit: 'contain'
  }
});


const InvoiceDocument = ({ order }) => (

  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.flexContainer}>
        <Image
          style={styles.logo}
          alt="image"
          src="/logo/adwrap.png"
        />
      </View>

      <View style={styles.flexContainerCenter}>
        <Text style={styles.invoiceHeader}>Order #{order.id}</Text>
      </View>



      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text>Product</Text></View>
          <View style={styles.tableColHeader}><Text>Materials</Text></View>
          <View style={styles.tableColHeader}><Text>Quantity</Text></View>
        </View>
        {order.orderItems.map((item, index) => {
          const imagePath = item.image.replace('https://storage.googleapis.com/decalshub/', '');
          return (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableColSizes}>
                <Image
                  style={styles.image}
                  alt="image"
                  src={`/api/proxy/${encodeURIComponent(imagePath)}`}
                />
              </View>
              <View style={styles.tableColSizes}>

                <Text style={styles.tableCellName}>{item.name}</Text>
                {item.product?.productMaterials.map((material, matIndex) => (
                  <Text key={matIndex} style={styles.tableCellMaterial}>
                    {material.material.name}
                  </Text>
                ))}
                <Text style={styles.tableCellSize}>Width: {item.width} inches</Text>
                <Text style={styles.tableCellSize}>Height: {item.height} inches</Text>
              </View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.quantity}</Text></View>
            </View>
          );
        })}
      </View>
    </Page>
  </Document>
);


const GeneratePdfButton = ({ order }) => {

  const downloadButton = (
    <PDFDownloadLink document={<InvoiceDocument order={order} />} fileName={`order_${order.id}.pdf`}>
      {({ loading }) =>
        loading ? 'Preparing document...' : (
          <IconButton
            aria-label="edit"
            sx={{
              borderRadius: '4px',
              backgroundColor: (theme) => theme.palette.primary.main,
              color: 'white',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.primary.dark,
                boxShadow: '0px 0px 12px rgba(0,0,0,0.3)',
                color: 'white',
              },
            }}
          >
            <FileDownloadIcon />
          </IconButton>
        )
      }
    </PDFDownloadLink>
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {downloadButton}
    </Box>
  );
};

export default GeneratePdfButton;


