import * as React from 'react';
import TextField from '../TextField';
import { useFormContext } from '../Form/Form.context';
import MuiAutocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListSubheader from '@mui/material/ListSubheader';
import Popper from '@mui/material/Popper';
import { useTheme, styled, SxProps } from '@mui/material/styles';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import Typography from '../Typography';
import CircularProgress from '@mui/material/CircularProgress';

const LISTBOX_PADDING = 8; // px

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + LISTBOX_PADDING,
  };

  if (dataSet.hasOwnProperty('group')) {
    return (
      <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
        {dataSet.group}
      </ListSubheader>
    );
  }

  return (
    <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
      {dataSet[1]}
    </Typography>
  );
}

const OuterElementContext = React.createContext<Omit<React.HTMLAttributes<HTMLElement>, 'children'>>({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);

  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);

  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactChild[] = [];
  (children as React.ReactChild[]).forEach(
    (item: React.ReactChild & { children?: React.ReactChild[] }) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    },
  );

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child: React.ReactChild) => {
    if (child.hasOwnProperty('group')) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }

    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * LISTBOX_PADDING}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    boxSizing: 'border-box',
    '& ul': {
      padding: 0,
      margin: 0,
    },
  },
});

type AutocompleteProps<T> = {
  name?: string;
  label?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  value?: NonNullable<T> | undefined;
  defaultValue?: NonNullable<T> | undefined;
  sx?: SxProps;
  fullWidth?: boolean;
  disablePortal?: boolean;
  freeSolo?: boolean;
  noOptionsText?: string;
  disableClearable?: boolean;
  onChange?: (event: React.ChangeEvent<{}>, value: T) => void;
  renderInput?: (params: any) => React.ReactNode;
  renderOption?: (props: any, option: T, state: any) => React.ReactNode;
  getOptionLabel?: (option: T) => string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
} & (
  | { async: true; options?: undefined; getOptions: () => Promise<T[]>; }
  | { async?: false; options: T[]; getOptions?: undefined; }
);

export default function Autocomplete<T>({
  name,
  label = '',
  placeholder,
  size = 'small',
  value,
  defaultValue,
  sx = {},
  fullWidth = false,
  onChange,
  renderInput,
  getOptionLabel = option => option as unknown as string,
  renderOption = (props, option, state) => [props, getOptionLabel(option), state] as React.ReactNode,
  async,
  options: _options,
  getOptions,
  error,
  helperText,
  disabled,
  disableClearable,
  ...props
}: AutocompleteProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<T[]>([]);
  const [hasLoadedOptions, setHasLoadedOptions] = React.useState(false);
  const loading = open && options.length === 0 && !hasLoadedOptions;
  const [internalValue, setInternalValue] = React.useState<NonNullable<T> | null>(value || defaultValue || null);

  const { errors } = useFormContext();

  React.useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    if (async === true) {
      (async () => {
        if (active && getOptions) {
          setOptions(await getOptions());
          setHasLoadedOptions(true);
        }
      })();
    } else {
      if (_options) {
        setOptions(_options);
        setHasLoadedOptions(true);
      }
    }

    return () => {
      active = false;
    };
  }, [loading, async, getOptions, _options]);

  React.useEffect(() => {
    if (async && open) {
      (async () => {
        if (getOptions) {
          setOptions(await getOptions());
        }
      })();
    }
  }, [open, async, getOptions]);

  return (
    <>
      <input type="hidden" name={name + ':' + 'json'} value={JSON.stringify(internalValue)} />
      <MuiAutocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        loading={loading}
        sx={{
          // height: 'auto!important',
          ...sx,
        }}

        disableClearable={disableClearable}
        disabled={disabled}
        disableListWrap
        PopperComponent={StyledPopper as any}
        ListboxComponent={ListboxComponent}
        options={options}

        size={size}
        fullWidth={fullWidth}
        renderInput={renderInput ? renderInput : (params) => (
          <TextField
            {...params}

            // name={name}
            // clearable
            error={error || !!(name && errors[name])}
            helperText={helperText || (name && errors[name] ? errors[name] : '')}
            label={label}
            {...(placeholder ? { placeholder } : {})}
            {...(async ? {
              InputProps: {
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              },
            } : {})}
          />
        )}
        renderOption={renderOption}
        getOptionLabel={(option: string | T) => getOptionLabel(option as T)}
        defaultValue={defaultValue}
        value={value}
        onChange={(event, value) => {
          onChange?.(event, value as T);
          setInternalValue(value as NonNullable<T>);
        }}
        {...props}
      />
    </>
  );
}
