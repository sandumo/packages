import { useEffect, useState } from 'react';
import { GridColDef } from '@mui/x-data-grid';
import { Button, Typography, Link, TextField, IconButton, Tooltip } from 'ui';
import Image from 'next/image';
import { Box } from '@mui/material';
import api, { Product } from 'api-client';
import { Currency, Table } from '@components';
import { useRouter } from 'next/router';
import { CopyIcon, DeleteIcon, EditIcon } from 'ui/icons';
import { useDialogConfirm } from '@hooks/useDialogCofirm';
import { useQuery } from '@tanstack/react-query';

export default function Page() {
  const router = useRouter();

  const { confirm } = useDialogConfirm();

  const { data: products = [] } = useQuery(api.product.getProductsQuery({ showInactives: true }));

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const updateProduct = (id: number, product: Partial<Omit<Product, 'id'>>) => api.product.updateProduct(id, product).then(() => api.cache.invalidate(api.product.getProductsQuery({}).queryKey));
  const deleteProduct = (id: number) => api.product.deleteProduct(id).then(() => api.cache.invalidate(api.product.getProductsQuery({}).queryKey));
  const duplicateProduct = (id: number) => api.product.duplicateProduct(id).then(async product => {
    api.cache.invalidate(api.product.getProductsQuery({}).queryKey);

    return await router.push(`/admin/products/${product.id}`);
  });

  useEffect(() => {
    if (products.length && selectedProduct) {
      setSelectedProduct(products.find(product => product.id === selectedProduct.id) || products[0]);
    }
  }, [products]);

  const columns: GridColDef<Product>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'image',
      headerName: 'Image',
      renderCell: ({ row }) => row.pictures.length ? (
        <Box sx={{ position: 'relative', height: 50, width: 100 }}>
          <Image src={'/api/storage/' + row.pictures[0]?.path} fill style={{ objectFit: 'cover' }} alt="" />
        </Box>
      ) : '',
      width: 100,
    },
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
    },
    {
      field: 'pricePerSquareMeter',
      headerName: 'Price/m2',
      renderCell: ({ value }) => <Currency>{value}</Currency>,
      width: 120,
    },
    {
      field: 'active',
      headerName: 'Status',
      width: 100,
      renderCell: ({ value }) => (
        <Box sx={{
          borderRadius: 1,
          border: 1,
          width: 72,
          px: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 28,
          fontWeight: 700,
          ...(value ? {
            bgcolor: 'success.light',
            borderColor: 'success.main',
            color: 'success.main',
          } : {
            bgcolor: 'error.light',
            borderColor: 'error.main',
            color: 'error.main',
          }),
        }}>
          {value ? 'Active' : 'Inactive'}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 140,
      renderCell: ({ row }) => (
        <>
          <Tooltip title="Edit">
            <IconButton href={`/admin/products/${row.id}`} stopPropagation>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton onClick={() => confirm('Confirm duplicate?', () => duplicateProduct(row.id))} stopPropagation>
              <CopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => confirm('Confirm delete?', () => deleteProduct(row.id))} stopPropagation>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', height: 30, mb: '1rem' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 20 }}>Products</Typography>
            <Button href="/admin/products/0" sx={{ fontSize: 14 }}>Create product</Button>
          </Box>

          <Table
            sx={{ flex: 1 }}
            rows={products}
            columns={columns}
            onRowClick={({ row }) => setSelectedProduct(row)}
          />
        </Box>

        {selectedProduct && (
          <Box sx={{ width: 400, ml: 4, display: 'flex', flexDirection: 'column'  }}>
            <Box sx={{ height: 30, mb: 4, display: 'flex', alignItems: 'flex-end' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flex: 1 }}>
                <Link href={`https://www.flooringsupplies.co.uk/product/${selectedProduct.id}/0`} target='_blank'>#{selectedProduct.id}</Link>
                <StatusSwitch value={selectedProduct.active} onChange={active => updateProduct(selectedProduct.id, { active })} />
              </Box>
            </Box>
            <Box sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 4,
              flex: 1,
              '& > *:not(:last-child)': {
                mb: 8,
              },
              overflowY: 'scroll',
              maxHeight: 'calc(100vh - 46px - 2rem)',
            }}>
              <Typography sx={{ mb: 6, fontWeight: 700 }}>{selectedProduct.title}</Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', '& > *': { mr: 2, mb: 2 } }}>
                {selectedProduct.pictures.map((picture) => (
                  <Box
                    key={picture.path}
                    sx={{
                      position: 'relative',
                      width: '100px',
                      aspectRatio: '1 / 1',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <Image src={'/api/storage/' + picture.path} fill style={{ objectFit: 'cover' }} alt="" />
                  </Box>
                ))}
              </Box>

              <Field label="Type" value={selectedProduct.category} />
              <Field label="Color" value={selectedProduct.color} />

              <Section title="Price">
                <Box sx={{ '& > *:not(:last-child)': { mb: 2 } }}>
                  <TextField label="Price per m2" value={selectedProduct.pricePerSquareMeter} />
                  <TextField label="Old price per m2" value={selectedProduct.oldPricePerSquareMeter} />
                  <TextField label="Price per pack" value={selectedProduct.pricePerPack} />
                </Box>
              </Section>

              <Section title="Description">
                <Typography sx={{ fontSize: 14 }}>
                  {selectedProduct.description}
                </Typography>
              </Section>

              <Section title="Highlights">
                <Box>
                  {selectedProduct.highlights.map((highlight, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', '& > *:not(:last-child)': { mr: 2 } }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{index + 1}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14 }}>{highlight}</Typography>
                    </Box>
                  ))}
                </Box>
              </Section>

              <Section title="Suitability">
                <Box>
                  {selectedProduct.suitability.map((suitability, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', '& > *:not(:last-child)': { mr: 2 } }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: 1, bgcolor: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ color: 'white', fontSize: 10, fontWeight: 700 }}>{index + 1}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14 }}>{suitability}</Typography>
                    </Box>
                  ))}
                </Box>
              </Section>

              <Section title="Specifications">
                <Box component="table" border="collapse">
                  {Object.keys(selectedProduct.specifications || {}).map((key, index) => (
                    <Box key={index} component="tr">
                      <Box component="td" sx={{ fontSize: 14, fontWeight: 700, pr: 2 }}>{key}</Box>
                      <Box component="td" sx={{ fontSize: 14 }}>{(selectedProduct.specifications as Record<string, any>)[key as string]}</Box>
                    </Box>
                  ))}
                </Box>
              </Section>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Field({ label, value }: { label: string, value: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'primary.main' }}>{label}</Typography>
      <Typography>{value}</Typography>
    </Box>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontWeight: 700, fontSize: 12, color: 'primary.main', mb: 1 }}>{children}</Typography>;
}

function Section({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <Box>
      <Heading>{title}</Heading>
      {children}
    </Box>
  );
}

function StatusSwitch({ value, onChange }: { value: boolean, onChange: (value: boolean) => void }) {
  // const [value, setValue] = useState<boolean>(true);

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      bgcolor: '#00000008',
      borderRadius: 1,
      height: 30,
      fontSize: 14,
      border: 1,
      borderColor: '#00000008',
      '& > *': {
        transition: 'all .2s ease',
      },
      width: 144,
    }}>
      <Box sx={{
        position: 'absolute',
        top: -1,
        bottom: -1,
        width: '50%',
        borderRadius: 1,
        border: 1,
        ...(value ? {
          left: 'calc(50% + 1px)',
          bgcolor: 'success.light',
          borderColor: 'success.main',
        } : {
          left: -1,
          bgcolor: 'error.light',
          borderColor: 'error.main',
        }),
      }} />

      <Box
        sx={{
          px: 2,
          width: 72,
          zIndex: 1,
          fontWeight: 600,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(!value ? {
            color: 'red',
          } : {
            cursor: 'pointer',
          }),
        }}
        onClick={() => onChange(false)}
      >
        Inactive
      </Box>

      <Box
        sx={{
          px: 2,
          width: 72,
          zIndex: 1,
          fontWeight: 600,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(value ? {
            color: 'green',
          } : {
            cursor: 'pointer',
          }),
        }}
        onClick={() => onChange(true)}
      >
        Active
      </Box>
    </Box>
  );
}
