import { Button } from '@sandumo/ui';
import { ArrowForwardIosIcon } from '@sandumo/ui/icons';

export default function Page() {

  const handleClick = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center gap-6 flex-col">
      <Button>Click me</Button>
      <Button color="primary">Click me</Button>
      <Button color="secondary" endIcon={<ArrowForwardIosIcon />} onClick={handleClick} className="rounded-full">
        Click me
      </Button>
    </div>
  );
}
