import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Index from "./routes";
import { FetchContext, useAxios } from "./fetchContext"; // Adjust the import path as necessary
import Service from "./routes/service";
import Details from "./routes/details";
import Confirmation from "./routes/confirmation";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/service/:service_id",
    element: <Service/>,
  },
  {
    path: "/details",
    element: <Details />,
  },
  {
    path: "/confirmation",
    element: <Confirmation />,
  }
]); 

function Handler() {
  const axiosInstance = useAxios(); // Use the custom hook to get the axios instance

  return (
    <FetchContext.Provider value={axiosInstance}>
      <div className="bg-gray-100 h-full w-full">
        <RouterProvider router={routes} />
      </div>
    </FetchContext.Provider>
  );
}

export default Handler;
