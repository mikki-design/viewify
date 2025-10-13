import { useToast } from "@/components/ui/use-toast";
import { Loader, UserCard } from "@/components/shared";
import { useGetUsers } from "@/lib/react-query/queries";
import { Helmet, HelmetProvider } from "react-helmet-async";

const AllUsers = () => {
  const { toast } = useToast();

  const {
    data: creators,
    isLoading,
    isError: isErrorCreators,
  } = useGetUsers();

  if (isErrorCreators) {
    toast({ title: "Something went wrong." });
    return (
      <HelmetProvider>
        <Helmet>
          <title>Error | Viewify</title>
          <meta
            name="description"
            content="An error occurred while fetching users. Please try again later."
          />
        </Helmet>
        <div className="common-container">
          <h2 className="h3-bold text-light-1">Something went wrong.</h2>
        </div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>All Users | Viewify</title>
        <meta
          name="description"
          content="Discover top creators and connect with amazing users on Viewify — the GenZ social platform for creative minds."
        />
        <meta property="og:title" content="All Users | Viewify" />
        <meta
          property="og:description"
          content="Browse all creators and find inspiring profiles on Viewify."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Viewify" />
      </Helmet>

      <div className="common-container">
        <div className="user-container">
          <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
          {isLoading && !creators ? (
            <Loader />
          ) : (
            <ul className="user-grid">
              {creators?.documents.map((creator) => (
                <li
                  key={creator?.$id}
                  className="flex-1 min-w-[200px] w-full"
                >
                  <UserCard user={creator} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </HelmetProvider>
  );
};

export default AllUsers;
