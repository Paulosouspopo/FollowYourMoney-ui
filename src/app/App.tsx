import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Providers } from '@/app/provider';
import { DisplayCurrencyScope } from '@/shared/currency/DisplayCurrencyScope';

function App() {
  return (
    <Providers>
      <DisplayCurrencyScope>
        <RouterProvider router={router} />
      </DisplayCurrencyScope>
    </Providers>
  );
}

export default App;