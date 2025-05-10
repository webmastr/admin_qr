// app/dashboard/emails/page.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import apiClient from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import { Download, RefreshCcw, Mail } from "lucide-react";

export default function EmailsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [emails, setEmails] = useState([]);
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

    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/stripe/email");

      // Set emails from the response
      setEmails(response.data.emails || []);

      setError(null);
    } catch (err) {
      console.error("Error fetching customer emails:", err);
      setError("Failed to fetch customer emails. Please try again later.");
      toast.error("Failed to load customer emails");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEmails();
    toast.success("Refreshing customer emails list");
  };

  const exportToCsv = () => {
    if (emails.length === 0) {
      toast.error("No emails to export");
      return;
    }

    // Create CSV content
    const headers = ["Email"];
    const csvRows = [headers.join(","), ...emails.map((email) => email)];
    const csvContent = csvRows.join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `customer-emails-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Customer emails exported to CSV");
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
            Loading customer emails...
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
          <Mail className="h-8 w-8 mr-3 text-indigo-500" />
          <div>
            <h1 className={`text-2xl font-semibold ${headingClass}`}>
              Customer Emails
            </h1>
            <p className={`mt-2 text-sm ${subTextClass}`}>
              View and manage customer emails from payment records
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
            disabled={emails.length === 0}
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

        {!error && emails.length === 0 ? (
          <div className={`p-8 text-center ${emptyStateClass} rounded-lg`}>
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className={`mt-2 text-lg font-medium ${headingClass}`}>
              No customer emails yet
            </h3>
            <p className={`mt-1 ${subTextClass}`}>
              There are no customer emails available at the moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className={darkMode ? "bg-gray-900" : "bg-gray-50"}>
                <tr>
                  <th scope="col" className={tableHeaderClass}>
                    #
                  </th>
                  <th scope="col" className={tableHeaderClass}>
                    Email Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {emails.map((email, index) => (
                  <tr
                    key={index}
                    className={
                      index % 2 === 0 ? tableRowClass : tableRowStripedClass
                    }
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}
                    >
                      {index + 1}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${headingClass}`}
                    >
                      {email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-600">
          <p className={`text-sm ${subTextClass}`}>
            Total customer emails:{" "}
            <span className="font-medium">{emails.length}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
