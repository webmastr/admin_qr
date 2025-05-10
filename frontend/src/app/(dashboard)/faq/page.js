// app/dashboard/userinfo/page.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import apiClient from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import { Download, RefreshCcw, Users } from "lucide-react";

export default function UserInfoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userInfos, setUserInfos] = useState([]);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Check for user preference in localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDark);
    }

    fetchUserInfos();
  }, []);

  const fetchUserInfos = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/newsletter/get-user-info");

      // Fix: Check for userInfo instead of userInfos in the response
      setUserInfos(response.data.userInfo || []);

      setError(null);
    } catch (err) {
      console.error("Error fetching user information:", err);
      setError("Failed to fetch user information. Please try again later.");
      toast.error("Failed to load user information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchUserInfos();
    toast.success("Refreshing user information list");
  };

  const exportToCsv = () => {
    if (userInfos.length === 0) {
      toast.error("No user information to export");
      return;
    }

    // Create CSV content
    const headers = ["ID", "Name", "Interest", "Favorite", "Date Submitted"];
    const csvRows = [
      headers.join(","),
      ...userInfos.map((info) => {
        const date = new Date(info.created_at).toLocaleDateString();
        return [info.id, info.name, info.interest, info.favorite, date].join(
          ","
        );
      }),
    ];
    const csvContent = csvRows.join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `user-information-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("User information exported to CSV");
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Dynamic classNames based on theme
  const pageClass = darkMode
    ? "bg-gray-900 text-gray-200"
    : "bg-gray-100 text-gray-800";
  const cardClass = darkMode ? "bg-gray-800 shadow" : "bg-white shadow";
  const headingClass = darkMode ? "text-gray-100" : "text-gray-900";
  const subTextClass = darkMode ? "text-gray-400" : "text-gray-500";
  const buttonPrimaryClass =
    "inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const buttonSecondaryClass = darkMode
    ? "inline-flex items-center py-2 px-4 border-2 border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    : "inline-flex items-center py-2 px-4 border-2 border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
  const errorBgClass = darkMode
    ? "bg-red-900 border-red-700"
    : "bg-red-100 border-red-300";
  const errorTextClass = darkMode ? "text-red-300" : "text-red-700";
  const tableHeaderClass = darkMode
    ? "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
    : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tableCellClass = darkMode ? "text-gray-300" : "text-gray-500";
  const tableRowClass = darkMode
    ? "bg-gray-800 hover:bg-gray-700"
    : "bg-white hover:bg-gray-50";
  const tableRowStripedClass = darkMode
    ? "bg-gray-900 hover:bg-gray-700"
    : "bg-gray-50 hover:bg-gray-100";
  const emptyStateClass = darkMode
    ? "bg-gray-800 border-2 border-gray-700"
    : "bg-gray-50 border-2 border-gray-200";

  if (isLoading) {
    return (
      <div className={`px-4 sm:px-6 lg:px-8 py-8 ${pageClass}`}>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className={`animate-pulse ${subTextClass}`}>
            Loading user information...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`px-4 sm:px-6 lg:px-8 py-8 ${pageClass} transition-colors duration-200`}
    >
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div className="flex items-center">
          <Users className="h-8 w-8 mr-3 text-indigo-500" />
          <div>
            <h1 className={`text-2xl font-semibold ${headingClass}`}>
              User Interests
            </h1>
            <p className={`mt-2 text-sm ${subTextClass}`}>
              View and manage user information submissions
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className={buttonSecondaryClass}
          >
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCsv}
            className={buttonPrimaryClass}
            disabled={userInfos.length === 0}
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${cardClass} overflow-hidden sm:rounded-lg`}
      >
        {error && (
          <div className={`mb-4 p-4 ${errorBgClass} border rounded-md`}>
            <p className={errorTextClass}>{error}</p>
          </div>
        )}

        {!error && userInfos.length === 0 ? (
          <div className={`p-8 text-center ${emptyStateClass} rounded-lg`}>
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className={`mt-2 text-lg font-medium ${headingClass}`}>
              No user information yet
            </h3>
            <p className={`mt-1 ${subTextClass}`}>
              There are no user information submissions at the moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className={darkMode ? "bg-gray-900" : "bg-gray-50"}>
                <tr>
                  {/* <th scope="col" className={tableHeaderClass}>
                    ID
                  </th> */}
                  <th scope="col" className={tableHeaderClass}>
                    Name
                  </th>
                  <th scope="col" className={tableHeaderClass}>
                    Interest
                  </th>
                  <th scope="col" className={tableHeaderClass}>
                    Favorite
                  </th>
                  <th scope="col" className={tableHeaderClass}>
                    Date Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {userInfos.map((info, index) => (
                  <tr
                    key={info.id}
                    className={
                      index % 2 === 0 ? tableRowClass : tableRowStripedClass
                    }
                  >
                    {/* <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}
                    >
                      {info.id}
                    </td> */}
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${headingClass}`}
                    >
                      {info.name}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}
                    >
                      {info.interest}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}
                    >
                      {info.favorite}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}
                    >
                      {formatDate(info.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-600">
          <p className={`text-sm ${subTextClass}`}>
            Total submissions:{" "}
            <span className="font-medium">{userInfos.length}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
