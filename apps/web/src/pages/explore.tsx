import { Container, Typography, Select, Checkbox, Box, BottomSheet, Button } from 'ui';
import ProductCard from '@components/ProductCard';
import { Grid, IconButton } from '@mui/material';
import { useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { ProductColor, productColorMapping } from '@utils/mappings';
import api, { Brand, Color, PriceRange, Suitability, Thickness, Range, Waterproof } from 'api-client';
import { DefaultLayout } from '@layouts';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next/types';
import { useRouter } from 'next/router';
import { Environment } from '@configs/env';

type FiltersType = {
  colors?: Color[],
  brands?: Brand[],
  priceRanges?: PriceRange[],
  thicknesses?: Thickness[],
  suitabilities?: Suitability[],
  waterproofs?: Waterproof[],
  ranges?: Range[],
}

function Page({
  products = [],
  colors,
  brands,
  priceRanges,
  thicknesses,
  suitabilities,
  waterproofs,
  ranges,
  filters: _filters,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [filters, _setFilters] = useState<FiltersType>(_filters || {});
  const [sortBy, setSortBy] = useState('Featured');

  const setFilters = (partialFilters: FiltersType) => {
    const newFilters = { ...filters, ...partialFilters };
    _setFilters(newFilters);
    router.replace({ query: { filters: JSON.stringify(newFilters) } }, undefined, { scroll: false });
  };

  const [open, setOpen] = useState(false);

  return (
    <Container sx={{ pt: 8, display: 'flex' }}>
      <Grid container spacing={6}>
        {/* Filters */}
        <Grid item xs={12} sm={4} md={3} sx={{ '@media (max-width: 600px)': { p: '0px!important' } }}>

          <BottomSheet
            open={open}
            onClose={() => setOpen(false)}
            controls={({ handleClose }) => (
              <Box sx={{ display: 'flex' }}>
                <Button sx={{ flex: 1, mr: 2 }} color="error" onClick={() => setFilters({})}>Clear</Button>
                <Button sx={{ flex: 1 }} onClick={() => handleClose()}>Apply</Button>
              </Box>
            )}
          >
            <Box sx={{ mb: 8 }}>
              <Box sx={{
                minHeight: 'calc(100vh - 64px - 32px * 2)',
                position: 'sticky',
                top: '2rem',
                '& > *:not(:last-child)': {
                  mb: 4,
                },
              }}>
                <FilterSection
                  title="Color"
                  options={colors}
                  getLabel={color => color.label}
                  getIcon={color => (
                    <Box sx={{ width: 16, aspectRatio: '1 / 1', borderRadius: '50%', bgcolor: productColorMapping[color.label as ProductColor], mr: 2, border: 1, borderColor: 'divider' }} />
                  )}
                  selectedOptions={filters.colors}
                  onSelectedOptionsChange={colors => setFilters({ colors })}
                />

                <FilterSection title="Brand" options={brands} getLabel={option => option.label} selectedOptions={filters.brands} onSelectedOptionsChange={brands => setFilters({ brands })} />
                <FilterSection title="Price Range" options={priceRanges} getLabel={option => option.label} selectedOptions={filters.priceRanges} onSelectedOptionsChange={priceRanges => setFilters({ priceRanges })} />
                <FilterSection title="Thickness" options={thicknesses} getLabel={option => option.label} selectedOptions={filters.thicknesses} onSelectedOptionsChange={thicknesses => setFilters({ thicknesses })} />
                <FilterSection title="Suitability" options={suitabilities} getLabel={option => option.label} selectedOptions={filters.suitabilities} onSelectedOptionsChange={suitabilities => setFilters({ suitabilities })} />
                <FilterSection title="Waterproof" options={waterproofs} getLabel={option => option.label} selectedOptions={filters.waterproofs} onSelectedOptionsChange={waterproofs => setFilters({ waterproofs })} />
                <FilterSection title="Range" options={ranges} getLabel={option => option.label} selectedOptions={filters.ranges} onSelectedOptionsChange={ranges => setFilters({ ranges })} />

                {/* <FilterSection title="Type" options={categories} /> */}
              </Box>
            </Box>
          </BottomSheet>
        </Grid>

        {/* Products */}
        <Grid item xs={12} sm={8} md={9}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Button onClick={() => setOpen(true)}>Filters ({Object.values(filters).reduce((acc, curr) => acc + curr.length, 0)})</Button>
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: 24, fontWeight: 700 }}>Results</Typography>
              </Box>
              <Box sx={{ mx: 'auto' }} />
              <Box sx={{ position: 'relative' }}>
                <Select
                  sx={{ minWidth: 160 }}
                  options={['Featured', 'Price: Low to High', 'Price: High to Low']}
                  value={sortBy}
                  onChange={value => setSortBy(value)}

                  // defaultValue="Featured"
                />
                <Typography sx={{ position: 'absolute', bottom: '100%', fontSize: 12, color: 'text.secondary' }}>Sort by</Typography>
              </Box>
            </Box>
            <Grid container spacing={6} sx={{ mb: 12 }}>
              {products?.map((product, index) => (
                <Grid item xs={12} sm={12} md={6} lg={4} key={index}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

function FilterSection<T>({
  title,
  options,
  selectedOptions = [],
  onSelectedOptionsChange,
  getLabel = (option: T) => option as unknown as string,
  getValue = getLabel,
  getIcon,
}: {
  title: string,
  options: T[],
  selectedOptions?: T[],
  onSelectedOptionsChange?: (selectedOptions: T[]) => void,
  getLabel?: (option: T) => string,
  getValue?: (option: T) => string | number | boolean,
  getIcon?: (option: T) => React.ReactNode,
}) {
  return (
    <Box sx={{
      borderRadius: 1,
      overflow: 'hidden',
      '& > *:not(:last-child)': {
        mb: '2px',
      },
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pr: 0.9 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
        </Box>
        <IconButton size="small">
          <KeyboardArrowDownRoundedIcon />
        </IconButton>
      </Box>
      {options.map((option, index) => {
        const checked = !!selectedOptions?.find(o => getValue?.(o) === getValue?.(option));

        return (
          <Box
            key={index}
            sx={{
              px: 2,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              color: '#00000080',
              bgcolor: '#00000004',
              border: 1,
              borderColor: '#00000010',
              borderRadius: 1,
              height: 32,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#00000010',
              },
            }}
            component="label"
          >
            {getIcon && getIcon(option)}
            <Box sx={{ flex: 1 }}>{getLabel(option)}</Box>
            <Box sx={{ mr: -2 }}>
              <Checkbox
                size="small"
                name={`${title}-${getLabel(option)}`}
                checked={checked}
                onChange={() => checked ? onSelectedOptionsChange?.((selectedOptions ?? []).filter(o => getValue(o) !== getValue(option))) : onSelectedOptionsChange?.([...selectedOptions ?? [], option])}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

Page.getLayout = (page: React.ReactNode) => <DefaultLayout>{page}</DefaultLayout>;

export default Page;

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  api.axios.defaults.baseURL = Environment.INTERNAL_API_URL;
  const filters = ctx.query.filters ? JSON.parse(ctx.query.filters as string) : {};

  const [
    products,
    colors,
    brands,
    priceRanges,
    thicknesses,
    suitabilities,
    waterproofs,
    ranges,
  ] = await Promise.all([
    api.product.getProducts({
      filters: JSON.stringify(filters),
    }),
    api.product.getColors(),
    api.product.getBrands(),
    api.product.getPriceRanges(),
    api.product.getThicknesses(),
    api.product.getSuitabilities(),
    api.product.getWaterproofs(),
    api.product.getRanges(),
  ]);

  return {
    props: {
      products,
      colors,
      brands,
      priceRanges,
      thicknesses,
      suitabilities,
      waterproofs,
      ranges,
      filters,
    },
  };
}
