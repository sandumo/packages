import { IconButton, Loading } from '@components';
import { useQuery } from '@tanstack/react-query';
import api, { Product } from 'api-client';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next/types';
import { Box, Button, Container, FilePicker, Form, Select, TextField, Typography } from 'ui';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { useEffect, useState } from 'react';
import { omit } from 'utils';
import { useRouter } from 'next/router';

export default function Page({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [product, setProduct] = useState<Product>();
  const [show, setShow] = useState(false);
  const { data: _product, isFetched } = useQuery({
    ...api.product.getProductQuery(id),
    enabled: id !== 0,
  });

  const updateProduct = (partialProduct: Partial<Omit<Product, 'id'>>) => {
    setProduct({ ...product, ...partialProduct } as Product);
  };

  useEffect(() => {
    if (isFetched && _product) {
      setProduct(_product);
      setShow(true);
    }
  }, [_product, setProduct, isFetched, setShow]);

  if (id !== 0 && !show) {
    return <Loading />;
  }

  const handleSubmit = async (data: Omit<Product, 'images' | 'pictures'> & { images: File[]; pictures: File[] }) => {

    const { pictures, ...rest } = data;

    // console.log('[x] pictures', pictures);

    const final = omit({
      ...product,
      ...data,
      waterproof: typeof product?.waterproof === 'boolean' ? product.waterproof : false,
    }, 'id', 'createdAt', 'updatedAt');

    // console.log('[x] submit', pictures);

    // return;

    if (id === 0) {
      if (!data.title || !data.category || !data.color || !data.description) {
        alert('Please fill all required fields');
      }

      const { id } = await api.product.createProduct(final as any);

      if (!id) {
        alert('Failed to create product');
      } else {
        alert('Product created');
      }

      setTimeout(() => {
        router.push(`/admin/products/${id}`);
      }, 500);
    } else {
      await api.product.updateProduct(id, final).then(async () => {
        // console.log('[x] update picture', data.pictures);

        await api.product.updateProductPictures(id, {
          pictures: (pictures?.filter(file => file instanceof File) || []) as File[],
        });
        alert('Product updated');
      });
    }

    api.cache.invalidate(api.product.getProductsQuery({}).queryKey);
  };

  return (
    <Box>
      <Container>
        <Typography variant="h5" sx={{ mb: 6, fontWeight: 700 }}>{id === 0 ? 'Create new prodct' : 'Update product'}</Typography>

        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Box sx={{ '& > *:not(:last-child)': { mb: 4 } }}>
            <TextField name="title" label="Title*" defaultValue={product?.title || ''} />

            <TextField name="category" label="Type*" defaultValue={product?.category || ''} />

            <TextField name="color" label="Color*" defaultValue={product?.color || ''} />

            <TextField name="brand" label="Brand*" defaultValue={product?.brand || ''} />

            <TextField name="thickness" label="Thickness*" defaultValue={product?.thickness || ''} type="number" />

            <Select name="waterproof" label="Waterproof*" options={['Yes', 'No']} value={product?.waterproof ? 'Yes' : 'No'} onChange={value => updateProduct({ waterproof: value === 'Yes' })} />

            <FilePicker name="pictures" label="Images" defaultValue={product?.pictures} />

            <TextField name="description" label="Description*" defaultValue={product?.description || ''} multiline minRows={4} />

            <Typography sx={{ fontWeight: 700, color: 'primary.main', mt: 8 }}>Price</Typography>
            <TextField name="pricePerSquareMeter" label="Price per m2" type="number" defaultValue={product?.pricePerSquareMeter || ''} />
            <TextField name="oldPricePerSquareMeter" label="Old orice per m2" type="number" defaultValue={product?.oldPricePerSquareMeter || ''} />
            <TextField name="pricePerPack" label="Price per pack" type="number" defaultValue={product?.pricePerPack || ''} />

            {/* Highlights */}
            <Typography sx={{ fontWeight: 700, color: 'primary.main', mt: 8 }}>Hightlights</Typography>
            <Box sx={{ '& > :not(:last-child)': { mb: 2 } }}>
              {product?.highlights?.map((highlight, index) => (
                <Box key={index} sx={{ display: 'flex' }}>
                  <TextField value={highlight} onChange={(e) => updateProduct({ highlights: product.highlights.map((h, i) => i === index ? e.target.value : h) })} key={index} sx={{ flex: 1 }} />
                  <IconButton sx={{ ml: 2 }} onClick={() => updateProduct({ highlights: product?.highlights.filter((_, i) => i !== index) })}>
                    <ClearRoundedIcon />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" variant="text" onClick={() => updateProduct({ highlights: [...(product?.highlights || []), ''] })}>Add hightlight</Button>
            </Box>

            {/* Suitability */}
            <Typography sx={{ fontWeight: 700, color: 'primary.main', mt: 8 }}>Suitability</Typography>
            <Box sx={{ '& > :not(:last-child)': { mb: 2 } }}>
              {product?.suitability?.map((suitability, index) => (
                <Box key={index} sx={{ display: 'flex' }}>
                  <TextField value={suitability} onChange={(e) => updateProduct({ suitability: product.suitability.map((h, i) => i === index ? e.target.value : h) })} sx={{ flex: 1 }} />
                  <IconButton sx={{ ml: 2 }} onClick={() => updateProduct({ suitability: product?.suitability.filter((_, i) => i !== index) })}>
                    <ClearRoundedIcon />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" variant="text" onClick={() => updateProduct({ suitability: [...(product?.suitability || []), ''] })}>Add suitability</Button>
            </Box>

            {/* Specifications */}
            <Typography sx={{ fontWeight: 700, color: 'primary.main', mt: 8 }}>Specifications</Typography>
            <Box sx={{ '& > :not(:last-child)': { mb: 2 } }}>
              {Object.keys(product?.specifications || {})?.map((key, index) => (
                <Box key={index} sx={{ display: 'flex' }}>
                  <TextField
                    placeholder="Key"
                    value={key}
                    onChange={(e) => updateProduct({
                      specifications: {
                        ...Object.keys(product?.specifications || {}).slice(0, index).reduce((acc, key) => ({ ...acc, [key]: (product?.specifications as any)[key] }), {}),
                        [e.target.value]: (product?.specifications as any)[key],
                        ...Object.keys(product?.specifications || {}).slice(index + 1).reduce((acc, key) => ({ ...acc, [key]: (product?.specifications as any)[key] }), {}),
                      },
                    })}
                    sx={{ mr: 2 }} />
                  <TextField placeholder="Value" value={(product?.specifications as any)[key]} onChange={(e) => updateProduct({ specifications: { ...product?.specifications, [key]: e.target.value } })} sx={{ flex: 1 }} />
                  <IconButton sx={{ ml: 2 }} onClick={() => updateProduct({ specifications: omit(product?.specifications, key) })}>
                    <ClearRoundedIcon />
                  </IconButton>
                </Box>
              ))}
              <Button size="small" variant="text" onClick={() => updateProduct({ specifications: { ...(product?.specifications || {}), '': ''  } })}>Add specification</Button>
            </Box>

            <TextField name="referenceURL" label="Reference URL" placeholder="Insert the URL from where you picked the product" defaultValue={product?.referenceURL || ''} />
          </Box>

          <Button type="submit" sx={{ mt: 8 }}>Save</Button>
        </Form>
      </Container>
    </Box>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      id: Number(ctx.params?.id) || 0,
    },
  };
}
