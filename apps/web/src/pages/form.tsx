import { Button, FilePicker, Form, TextField } from '@sandumo/ui';
import api from 'api-client';

export default function Page() {
  const handleSubmit = async (data: any) => {
    console.log('[x] data', data);

    // const response = await api.axios.post('/products', toFormData({ ...data, highlights: ['1', '2'] }), { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

    const response = await api.axios.get('/languages', { params: {
      filter: {
        and: [
          { field: 'locale',
            operator: 'eq',
            value: 'en' },
          { field: 'locale',
            operator: 'eq',
            value: 'en' },
        ],

      },
    } }).then(res => res.data);

    // console.log('[x] response', response);
  };

  const handleSubmit2 = async (data: any) => {
    console.log('[x] data', data);

    // const response = await api.axios.post('/products', toFormData(data), { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
    const response = await api.axios.post('/categories', data).then(res => res.data);

    console.log('[x] response', response);
  };

  const update = async () => {
    // const response = await api.axios.get('/languages', { params: {
    //   filter: {
    //     locale: 'en',
    //   },
    // } }).then(res => res.data);

    // const response = await api.axios.get('/posts', { params: {
    //   include: ['comments', 'author.name'],
    // } }).then(res => res.data);

    const data = {
      post: {
        id: 1,
        status: 'active',
        moderated: true,

        translations: {
          en: {
            title: 'New Post Title EN',
          },
          ru: {
            title: 'New Post Title RU',
          },
        },
      },
      translations: {
        en: {
          // title: 'New Post Title EN',
          content: 'New Comment Content EN',
        },
        ru: {
          // title: 'New Post Title RU',
          content: 'New Comment Content RU',
        },
      },
    };

    // const response = await api.axios.patch('/comments/1', data).then(res => res.data);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    const response = await api.axios.patch('/comments/1', objectToFormData({ ...data, picture: file }), { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

    console.log('[x] response', response);
  };

  const create = async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    const data = {
      picture: file,
      post: {
        status: 'active',
        moderated: true,
        pictures: [file, file],
        translations: {
          en: {
            title: 'New Post Title EN',
          },
          ru: {
            title: 'New Post Title RU',
          },
        },
      },
      translations: {
        en: {
          // title: 'New Post Title EN',
          content: 'New Comment Content EN',
        },
        ru: {
          // title: 'New Post Title RU',
          content: 'New Comment Content RU',
        },
      },
    };

    // const response = await api.axios.patch('/comments/1', data).then(res => res.data);

    const response = await api.axios.post('/comments', objectToFormData({ ...data }), { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

    console.log('[x] response', response);
  };

  // console.log('[x] flatObject', objectToFormData({ a: { b: { c: 'd' }, e: ['f', 'g'] } }));

  return (
    <div className="flex flex-col gap-4 p-6 items-center justify-center min-h-screen">
      <Form onSubmit={handleSubmit}>
        <TextField name="category" label="Category" defaultValue="cat1" />
        <TextField name="name" label="Name" defaultValue="name1" />
        <TextField name="price" label="Price" defaultValue="100" />

        <FilePicker name="pictures" label="Pictures" />

        <FilePicker name="file" label="File" />

        <Button type="submit" sx={{ mt: 4 }}>Submit</Button>

      </Form>

      {/* <Form onSubmit={handleSubmit2}>
        <TextField name="category" label="Category" />
        <TextField name="name" label="Name" />
        <TextField name="price" label="Price" />

        <FilePicker name="file" label="File" />

        <Button type="submit" sx={{ mt: 4 }}>Submit</Button>

      </Form> */}

      <Button onClick={create} color="primary">Create</Button>
      <Button onClick={update} color="primary">Update</Button>
      {/* <br />
      <Button onClick={() => api.axios.post('/posts', { title: 'My Post', content: 'My Content' })} sx={{ mt: 4 }}>Create Post</Button> */}
    </div>
  );
}

export function toFormData(data: Record<string, any>) {
  const formData = new FormData();

  for (const key in data) {
    if (Array.isArray(data[key])) {
      for (const item of data[key]) {
        formData.append(key, item);
      }
    } else if (data[key] && typeof data[key] === 'object') {
      Object.keys(data[key]).forEach(subKey => {
        if (subKey) {
          formData.append(`${key}[${subKey}]`, data[key][subKey]);
        }
      });
    } else {
      let value = data[key];

      if (value === null || value === undefined) {
        value = '';
      }

      formData.append(key, value);
    }
  }

  return formData;
}

function flatObject(obj: Record<string, any>, prefix: string = '') {
  let result: Record<string, any> = {};

  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result = { ...result, ...flatObject(obj[key], `${prefix}${key}.`) };
    } else if (Array.isArray(obj[key])) {
      result[`${prefix}${key}`] = obj[key].map(item => typeof item === 'object' ? JSON.stringify(item) : item);
    } else {
      result[`${prefix}${key}`] = obj[key];
    }
  }

  return result;
}

function appendFormData(formData: FormData, data: any, parentKey: string = ''): void {
  if (data && typeof data === 'object' && !(data instanceof File)) {
    Object.keys(data).forEach(key => {
      const newKey = parentKey ? `${parentKey}[${key}]` : key;
      appendFormData(formData, data[key], newKey);
    });
  } else if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const newKey = `${parentKey}[${index}]`;
      appendFormData(formData, item, newKey);
    });
  } else {
    formData.append(parentKey, data);
  }
}

function objectToFormData(obj: any): FormData {
  const formData = new FormData();
  appendFormData(formData, obj);

  return formData;
}
