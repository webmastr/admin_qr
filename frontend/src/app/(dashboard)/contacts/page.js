// app/dashboard/contacts/page.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { toast } from "react-hot-toast";
import { Download, RefreshCcw, Phone, Mail, Trash2 } from "lucide-react";

export default function ContactsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
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

    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/contact/getContact");
      setContacts(response.data.submissions || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to fetch contacts. Please try again later.");
      toast.error("Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchContacts();
    toast.success("Refreshing contacts list");
  };

  const exportToCsv = () => {
    if (contacts.length === 0) {
      toast.error("No contacts to export");
      return;
    }

    // Create CSV content
    const headers = ["ID", "Name", "Email", "Subject", "Message", "Date"];
    const csvRows = [
      headers.join(","),
      ...contacts.map((contact) => {
        const date = new Date(contact.submitted_at).toLocaleDateString();
        const safeMessage = contact.message
          .replace(/,/g, ";")
          .replace(/\n/g, " ");
        return [
          contact.id,
          contact.name,
          contact.email,
          contact.subject.replace(/,/g, ";"),
          `"${safeMessage}"`,
          date,
        ].join(",");
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
      `contacts-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Contacts exported to CSV");
  };

  const handleDeleteContact = (id) => {
    // In a real application, you would make an API call to delete the contact
    setContacts(contacts.filter((contact) => contact.id !== id));
    toast.success("Contact deleted successfully");
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

  // Truncate text with ellipsis if it's too long
  const truncateText = (text, maxLength = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
  const buttonDangerClass = darkMode
    ? "inline-flex items-center py-1 px-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    : "inline-flex items-center py-1 px-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500";
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
            Loading contacts...
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
          <Phone className="h-8 w-8 mr-3 text-indigo-500" />
          <div>
            <h1 className={`text-2xl font-semibold ${headingClass}`}>
              Contact Messages
            </h1>
            <p className={`mt-2 text-sm ${subTextClass}`}>
              View and manage contact form submissions
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
            disabled={contacts.length === 0}
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

        {!error && contacts.length === 0 ? (
          <div className={`p-8 text-center ${emptyStateClass} rounded-lg`}>
            <Phone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className={`mt-2 text-lg font-medium ${headingClass}`}>
              No contact messages
            </h3>
            <p className={`mt-1 ${subTextClass}`}>
              You haven't received any contact form submissions yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className={darkMode ? "bg-gray-900" : "bg-gray-50"}>
                <tr>
                  <th scope="col" className={tableHeaderClass}>
                    Name
                  </th>
                  <th scope="col" className={tableHeaderClass}>
                    Email
                  </th>
                  <th scope="col" className={tableHeaderClass}>
                    Subject
                  </th>
                  <th scope="col" className={tableHeaderClass}>
                    Message
                  </th>
                  <th scope="col" className={tableHeaderClass}>
                    Date
                  </th>
                  {/* <th scope="col" className={tableHeaderClass}>
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {contacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className={
                      index % 2 === 0 ? tableRowClass : tableRowStripedClass
                    }
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${headingClass}`}
                    >
                      {contact.name}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}
                    >
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center hover:text-indigo-400"
                      >
                        <Mail size={14} className="mr-1" />
                        {contact.email}
                      </a>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}
                    >
                      {truncateText(contact.subject)}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${tableCellClass} max-w-xs`}
                    >
                      {truncateText(contact.message, 50)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}
                    >
                      {formatDate(contact.submitted_at)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${tableCellClass}`}
                    >
                      {/* <div className="flex space-x-2">
                        <button
                          className={buttonDangerClass}
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-600">
          <p className={`text-sm ${subTextClass}`}>
            Total contact messages:{" "}
            <span className="font-medium">{contacts.length}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
