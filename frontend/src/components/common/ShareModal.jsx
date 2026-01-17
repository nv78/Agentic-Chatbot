import React, { useState, useEffect, useCallback } from "react";
import { chatAPI } from "../../utils/api";

const ShareModal = ({ isOpen, onClose, chatUuid, chatName, theme }) => {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const fetchShareStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatAPI.getShareLink(chatUuid);
      console.log(data)
      setShareData(data);
    } catch (err) {
      setError(err.message || "Failed to load share link");
    } finally {
      setLoading(false);
    }
  }, [chatUuid]);

  useEffect(() => {
    if (isOpen && chatUuid) {
      fetchShareStatus();
      setCopied(false);
    }
  }, [isOpen, chatUuid, fetchShareStatus]);

  const handleCreateLink = async () => {
    try {
      setIsToggling(true);
      setError(null);
      const data = await chatAPI.createShareLink(chatUuid, true);
      setShareData({
        share_uuid: data.share_uuid,
        is_active: true,
        view_count: 0,
      });
    } catch (err) {
      setError(err.message || "Failed to create share link");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDisableLink = async () => {
    try {
      setIsToggling(true);
      setError(null);
      await chatAPI.deleteShareLink(chatUuid);
      setShareData({
        share_uuid: null,
        is_active: false,
      });
      setCopied(false);
    } catch (err) {
      setError(err.message || "Failed to disable share link");
    } finally {
      setIsToggling(false);
    }
  };


  const handleCopyLink = async () => {
    if (!shareData?.share_uuid) return;

    const shareUrl = `${window.location.origin}/shares/${shareData.share_uuid}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Failed to copy link to clipboard");
    }
  };

  if (!isOpen) return null;

  const shareUrl = shareData?.share_uuid
    ? `${window.location.origin}/shares/${shareData.share_uuid}`
    : "";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } rounded-lg shadow-xl max-w-lg w-full p-6 relative`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${
            theme === "dark"
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`}
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Share Chat</h2>
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            {chatName || "Untitled Chat"}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : (
          <div>
            {/* Share status */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Share Link</span>
                <button
                  onClick={
                    shareData?.is_active ? handleDisableLink : handleCreateLink
                  }
                  disabled={isToggling}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    isToggling ? "opacity-50 cursor-not-allowed" : ""
                  } ${shareData?.is_active ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                      shareData?.is_active ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {shareData?.is_active
                  ? "Anyone with the link can view this chat"
                  : "Create a link to share this chat publicly"}
              </p>
            </div>

            {/* Share URL and copy button */}
            {shareData?.is_active && shareUrl && (
              <div className="mb-6">
                <div
                  className={`flex items-center ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                  } border rounded-lg p-3`}
                >
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className={`flex-1 ${
                      theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-50 text-gray-900"
                    } outline-none text-sm truncate`}
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`ml-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      copied
                        ? "bg-green-600 text-white"
                        : theme === "dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                {/* Stats */}
                {shareData.view_count !== undefined && (
                  <div
                    className={`mt-3 text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Views: {shareData.view_count}
                    {shareData.created_at && (
                      <span className="ml-3">
                        Created:{" "}
                        {new Date(shareData.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Warning message */}
            {shareData?.is_active && (
              <div
                className={`${
                  theme === "dark"
                    ? "bg-yellow-900 border-yellow-700 text-yellow-200"
                    : "bg-yellow-50 border-yellow-300 text-yellow-800"
                } border rounded-lg p-3`}
              >
                <div className="flex">
                  <svg
                    className="w-5 h-5 mr-2 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm">
                    Anyone with this link can view the chat and its contents.
                    Disable the link to stop sharing.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ShareModal;
