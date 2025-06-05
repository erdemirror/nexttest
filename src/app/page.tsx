"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";

type FormValues = {
  name: string;
  role: string;
  terms: boolean;
};

type User = {
  id: string;
  name: string;
  role: string;
};

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: "", role: "", terms: false },
  });

  const [submittedName, setSubmittedName] = useState<string>("");
  const [submittedRole, setSubmittedRole] = useState<string>("");
  const [graphqlResult, setGraphqlResult] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sendGraphQLRequest = async (query: string, variables?: any) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      console.error("GraphQL Error:", error);
      setGraphqlResult(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (name: string, role: string) => {
    const mutation = `
      mutation CreateUser($name: String!, $role: String!) {
        createUser(name: $name, role: $role) {
          id
          name
          role
        }
      }
    `;

    const data = await sendGraphQLRequest(mutation, { name, role });

    if (data && data.createUser) {
      setGraphqlResult(
        `User created: ${data.createUser.name} (${data.createUser.role})`
      );
      await fetchUsers();
    }
  };

  const fetchUsers = async () => {
    const query = `
      query GetUsers {
        users {
          id
          name
          role
        }
      }
    `;

    const data = await sendGraphQLRequest(query);

    if (data && data.users) {
      setUsers(data.users);
      setGraphqlResult(`Loaded ${data.users.length} users from server`);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setSubmittedName(data.name);
    setSubmittedRole(data.role);
    await createUser(data.name, data.role);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-cyan-500 to-blue-500 items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl p-8 rounded-2xl max-w-lg w-full text-center space-y-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          my mind is my arcanery
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="text-lg italic text-white block mb-2">
              Нэрээ оруулна уу:
            </label>
            <input
              className="w-full p-3 rounded-md bg-white text-black shadow-lg placeholder-gray-700"
              placeholder="Таны нэр"
              {...register("name", {
                required: "Нэр заавал оруулах ёстой.",
                maxLength: {
                  value: 20,
                  message: "Нэр 20 тэмдэгтээс ихгүй байх ёстой.",
                },
              })}
            />
            {errors.name && (
              <p className="text-red-300 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-lg italic text-white block mb-2">
              Та role оо сонгоно уу:
            </label>
            <select
              className="w-full p-3 rounded-md shadow-lg bg-white text-black"
              {...register("role", {
                required: "Role заавал сонгох ёстой.",
              })}
            >
              <option value="">Сонгох</option>
              <option value="Оюутан">Оюутан</option>
              <option value="Инженер">Инженер</option>
              <option value="Багш">Багш</option>
            </select>
            {errors.role && (
              <p className="text-red-300 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2">
            <input
              type="checkbox"
              {...register("terms", {
                required: "Та нөхцөл зөвшөөрөх ёстой.",
              })}
              className="w-4 h-4"
            />
            <label className="text-white text-sm">
              Үнэн зөв бөглөсөн эсэх?
            </label>
          </div>
          {errors.terms && (
            <p className="text-red-300 text-sm mt-1">{errors.terms.message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-white shadow-lg px-6 py-3 rounded-md text-black font-semibold cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending GraphQL..." : "Send GraphQL Mutation"}
          </button>
        </form>

        <h1 className="text-lg font-semibold italic text-white">
          Ухаантай {submittedName || "..."}
          {submittedRole ? `(${submittedRole})` : "(Тодорхойгүй)"}
        </h1>

        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="bg-white shadow-lg px-6 py-3 rounded-md text-black font-semibold cursor-pointer hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "..." : ""} Fetch Users (GraphQL Query)
          </button>
        </div>

        {graphqlResult && (
          <div className="bg-gray-500/20 border border-black p-4 rounded-md">
            <p className="text-white text-sm font-mono">{graphqlResult}</p>
          </div>
        )}

        {users.length > 0 && (
          <div className="bg-blue-500/20 border border-blue-400 p-4 rounded-md max-h-60 overflow-y-auto">
            <h3 className="text-white font-bold mb-3">
              Users from GraphQL Server ({users.length}):
            </h3>
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white/10 p-3 rounded mb-2 border-l-4 border-purple-400"
              >
                <p className="text-white">
                  <strong>{user.name}</strong> - {user.role}
                </p>
                <p className="text-gray-300 text-xs">ID: {user.id}</p>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-white">
              GraphQL Request in progress...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
