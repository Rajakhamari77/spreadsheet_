"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  ChevronDown,
  Search,
  Bell,
  Plus,
  Download,
  Upload,
  Share2,
  Filter,
  Eye,
  MoreHorizontal,
  Clock,
  ChevronRight,
} from "lucide-react"

const SpreadsheetApp = () => {
  // selectedCell: [rowIndex, visibleColIndex] where visibleColIndex includes the # column (0-indexed)
  const [selectedCell, setSelectedCell] = useState(null)
  const [activeTab, setActiveTab] = useState("Q3 Financial Overview")
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [isEditing, setIsEditing] = useState(false)
  // editingCell: [rowIndex, visibleColIndex]
  const [editingCell, setEditingCell] = useState(null)
  const tableRef = useRef(null)

  const data = [
    {
      id: 1,
      jobRequest: "Launch social media campaign for product launch",
      submitted: "15-11-2024",
      status: "In-process",
      submitter: "Aisha Patel",
      url: "www.aishapatel.com",
      assigned: "Sophie Choudhury",
      priority: "Medium",
      dueDate: "20-11-2024",
      estValue: "6,200,000",
    },
    {
      id: 2,
      jobRequest: "Update press kit for company redesign",
      submitted: "28-10-2024",
      status: "Need to start",
      submitter: "Irfan Khan",
      url: "www.irfankhanpr.com",
      assigned: "Tejas Pandey",
      priority: "High",
      dueDate: "30-10-2024",
      estValue: "3,500,000",
    },
    {
      id: 3,
      jobRequest: "Finalize user testing feedback for app redesign",
      submitted: "05-12-2024",
      status: "In-process",
      submitter: "Mark Johnson",
      url: "www.markjohns.com",
      assigned: "Rachel Lee",
      priority: "Medium",
      dueDate: "10-12-2024",
      estValue: "4,750,000",
    },
    {
      id: 4,
      jobRequest: "Design new features for the website",
      submitted: "10-01-2025",
      status: "Complete",
      submitter: "Emily Green",
      url: "www.emilygreen.com",
      assigned: "Tom Wright",
      priority: "Low",
      dueDate: "15-01-2025",
      estValue: "5,900,000",
    },
    {
      id: 5,
      jobRequest: "Prepare financial report for Q4",
      submitted: "25-01-2025",
      status: "Blocked",
      submitter: "Jessica Brown",
      url: "www.jessicabrown.com",
      assigned: "Kevin Smith",
      priority: "Low",
      dueDate: "30-01-2025",
      estValue: "2,800,000",
    },
  ]

  const tabs = [
    { id: "overview", name: "Q3 Financial Overview", icon: Clock, color: "bg-slate-200 text-slate-700" },
    { id: "abc", name: "ABC", color: "bg-teal-100 text-teal-700" },
    { id: "question", name: "Answer a question", color: "bg-purple-100 text-purple-700" },
    { id: "extract", name: "Extract", color: "bg-orange-100 text-orange-700" },
  ]

  // Column definitions for data columns (excluding the row number column)
  const columns = [
    { key: "jobRequest", label: "Job Request", width: "w-[320px]" }, // Adjusted width
    { key: "submitted", label: "Submitted", width: "w-[128px]" },
    { key: "status", label: "Status", width: "w-[128px]" },
    { key: "submitter", label: "Submitter", width: "w-[144px]" },
    { key: "url", label: "URL", width: "w-[160px]" },
    { key: "assigned", label: "Assigned", width: "w-[144px]" },
    { key: "priority", label: "Priority", width: "w-[96px]" },
    { key: "dueDate", label: "Due Date", width: "w-[112px]" },
    { key: "estValue", label: "Est. Value", width: "w-[112px]" },
  ]

  // Calculate total visible columns, including the # column
  const totalVisibleColumns = columns.length + 1 // +1 for the # column

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "in-process":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "need to start":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "complete":
        return "bg-green-100 text-green-800 border-green-200"
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-700 font-semibold"
      case "medium":
        return "text-orange-700 font-semibold"
      case "low":
        return "text-blue-700 font-semibold"
      default:
        return "text-gray-700"
    }
  }

  // Handle cell click (selection)
  const handleCellClick = useCallback((rowIndex, visibleColIndex) => {
    setSelectedCell([rowIndex, visibleColIndex])
    setIsEditing(false) // Exit editing mode when a new cell is selected
    setEditingCell(null)
    console.log(`Cell clicked: Row ${rowIndex}, Column ${visibleColIndex}`)
  }, [])

  // Handle cell double click (start editing)
  const handleCellDoubleClick = useCallback((rowIndex, visibleColIndex) => {
    setEditingCell([rowIndex, visibleColIndex])
    setIsEditing(true)
    console.log(`Cell double-clicked for editing: Row ${rowIndex}, Column ${visibleColIndex}`)
  }, [])

  // Handle column sorting
  const handleSort = useCallback((key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
    console.log(`Sorting by ${key} in ${direction} order`)
  }, [sortConfig])

  // Handle row selection (checkbox)
  const handleRowSelection = useCallback((rowId) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId)
    } else {
      newSelected.add(rowId)
    }
    setSelectedRows(newSelected)
    console.log(`Row ${rowId} selection toggled`)
  }, [selectedRows])

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!selectedCell) return

    const [row, col] = selectedCell // col is visibleColIndex (0 to totalVisibleColumns - 1)
    let newRow = row
    let newCol = col

    switch (e.key) {
      case "ArrowUp":
        newRow = Math.max(0, row - 1)
        e.preventDefault()
        break
      case "ArrowDown":
        newRow = Math.min(data.length - 1 + 10, row + 1) // Allow navigation into empty rows, 10 empty rows
        e.preventDefault()
        break
      case "ArrowLeft":
        newCol = Math.max(0, col - 1)
        e.preventDefault()
        break
      case "ArrowRight":
        newCol = Math.min(totalVisibleColumns - 1, col + 1)
        e.preventDefault()
        break
      case "Enter":
        if (selectedCell) {
          if (isEditing) {
            setIsEditing(false)
            setEditingCell(null)
          } else {
            setIsEditing(true)
            setEditingCell(selectedCell)
          }
        }
        e.preventDefault()
        return
      case "Escape":
        setIsEditing(false)
        setEditingCell(null)
        e.preventDefault()
        return
      default:
        return
    }

    // Only update selectedCell if a new valid cell is found
    if (newRow !== row || newCol !== col) {
      setSelectedCell([newRow, newCol])
      setIsEditing(false) // Exit editing mode on navigation
      setEditingCell(null)
    }
  }, [selectedCell, isEditing, data.length, totalVisibleColumns])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Render function for individual cells
  const renderCell = (item, column, rowIndex, colIndex) => {
    // visibleColIndex is 1-indexed here because the first column is the checkbox/row number
    const visibleColIndex = colIndex + 1
    const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === visibleColIndex
    const isEditingThis = editingCell && editingCell[0] === rowIndex && editingCell[1] === visibleColIndex && isEditing

    let cellContent

    switch (column.key) {
      case "status":
        cellContent = (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold ${getStatusColor(item[column.key])}`}>
            {item[column.key]}
          </span>
        )
        break
      case "priority":
        cellContent = <span className={`text-xs ${getPriorityColor(item[column.key])}`}>{item[column.key]}</span>
        break
      case "url":
        cellContent = (
          <a href={`https://${item[column.key]}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate">
            {item[column.key]}
          </a>
        )
        break
      case "estValue":
        cellContent = (
          <span className="font-mono text-sm text-gray-900 flex items-center">
            {item[column.key]} <span className="ml-0.5 text-gray-400">₹</span>
          </span>
        )
        break
      default:
        cellContent = <span className="text-sm text-gray-900">{item[column.key]}</span>
    }

    return (
      <td
        key={column.key}
        className={`${column.width} px-3 py-2 border-r border-gray-200 cursor-cell relative transition-all duration-150 ${
          isSelected ? "ring-2 ring-blue-400 bg-blue-50 shadow-sm z-10" : "hover:bg-gray-50"
        } ${isEditingThis ? "bg-white" : ""}`} // Ensure editing cell is white
        onClick={() => handleCellClick(rowIndex, visibleColIndex)}
        onDoubleClick={() => handleCellDoubleClick(rowIndex, visibleColIndex)}
      >
        {isEditingThis ? (
          <input
            type="text"
            defaultValue={item[column.key]}
            className="w-full h-full bg-transparent outline-none text-sm border border-blue-400 rounded-sm p-0.5 focus:ring-0 absolute inset-0 box-border"
            onBlur={() => {
              setIsEditing(false)
              setEditingCell(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setIsEditing(false)
                setEditingCell(null)
              }
            }}
            autoFocus
          />
        ) : (
          cellContent
        )}
      </td>
    )
  }

  // Common button styles for toolbar actions
  const toolbarButtonClass = "flex items-center space-x-1 px-3 py-1.5 text-sm rounded-md border transition-all duration-200"
  const toolbarButtonDefault = `${toolbarButtonClass} text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100`
  const toolbarButtonActive = `${toolbarButtonClass} bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-base font-bold leading-none -mt-0.5">□</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Workspace</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span>Folder 2</span>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-gray-900 font-medium">Spreadsheet 3</span>
              <button
                onClick={() => console.log("More options for Spreadsheet 3 clicked")}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search within sheet"
                className="pl-10 pr-4 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-56"
                onChange={(e) => console.log(`Searching: ${e.target.value}`)}
              />
            </div>
            <button
              onClick={() => console.log("Notifications clicked")}
              className="relative p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-medium">J</span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">John Doe</div>
                <div className="text-xs text-gray-500">john.doe@company.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 sticky top-12 z-10 shadow-sm">
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => console.log("Tool bar dropdown clicked")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-all duration-200"
            >
              <span className="font-medium">Tool bar</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => { setShowFilters(!showFilters); console.log("Hide fields toggled") }}
                className={showFilters ? toolbarButtonActive : toolbarButtonDefault}
              >
                <Eye className="w-4 h-4" />
                <span>Hide fields</span>
              </button>
              <button
                onClick={() => handleSort("submitted")}
                className={toolbarButtonDefault}
              >
                <span>Sort</span>
                {sortConfig.key === "submitted" && (
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      sortConfig.direction === "desc" ? "rotate-180" : ""
                    } ${sortConfig.key === "submitted" ? "text-blue-500" : "text-gray-400"}`}
                  />
                )}
              </button>
              <button
                onClick={() => { setShowFilters(!showFilters); console.log("Filter toggled") }}
                className={showFilters ? toolbarButtonActive : toolbarButtonDefault}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
              <button
                onClick={() => console.log("Cell view clicked")}
                className={toolbarButtonDefault}
              >
                <span>Cell view</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => console.log("Import clicked")}
              className={toolbarButtonDefault}
            >
              <Download className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button
              onClick={() => console.log("Export clicked")}
              className={toolbarButtonDefault}
            >
              <Upload className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => console.log("Share clicked")}
              className={toolbarButtonDefault}
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={() => console.log("New Action clicked")}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 active:bg-green-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New Action</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 py-0 sticky top-22 z-10"> {/* Adjusted top for stickiness below toolbar */}
        <div className="flex items-center space-x-0 -mb-px"> {/* -mb-px to align border-b */}
          <div className="flex items-center space-x-1"> {/* Group for "Q3 Financial Overview" tab and dropdown */}
            <span className="text-sm font-semibold text-gray-900 px-4 py-2">Q3 Financial Overview</span>
            <button
              onClick={() => console.log("Q3 Financial Overview dropdown clicked")}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="h-6 w-px bg-gray-200 mx-2"></div> {/* Vertical separator */}

          {tabs.filter(tab => tab.id !== "overview").map((tab) => ( // Filter out "Q3 Financial Overview" from this map
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.name); console.log(`Tab selected: ${tab.name}`) }}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab.name
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-200"
              }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4 text-gray-500" />}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${tab.color} ${
                  activeTab === tab.name ? "shadow-sm" : ""
                }`}
              >
                {tab.name}
              </span>
              {tab.name === "ABC" && <span className="text-xs text-gray-400 ml-1">•••</span>}
            </button>
          ))}
          <button
            onClick={() => console.log("Add new tab clicked")}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto relative"> {/* overflow-auto for scrollable content */}
        <div className="bg-white min-w-max"> {/* min-w-max to prevent horizontal scroll issues */}
          <table ref={tableRef} className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10"> {/* Sticky header for table */}
                <th className="w-[48px] px-2 py-2 border-r border-gray-200 text-left bg-gray-50"> {/* Adjusted width */}
                  <span className="text-xs font-medium text-gray-500">#</span>
                </th>
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`${column.width} px-3 py-2 border-r border-gray-200 text-left cursor-pointer hover:bg-gray-100 active:bg-gray-200 bg-gray-50 transition-all duration-200 ${
                      sortConfig.key === column.key ? "bg-blue-50 text-blue-700" : ""
                    }`}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span
                        className={`text-xs font-medium ${
                          sortConfig.key === column.key ? "text-blue-700" : "text-gray-600"
                        }`}
                      >
                        {column.label}
                      </span>
                      {sortConfig.key === column.key && ( // Show sort icon only if sorted by this column
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            sortConfig.direction === "desc" ? "rotate-180" : ""
                          } ${sortConfig.key === column.key ? "text-blue-500" : "text-gray-400"}`}
                        />
                      )}
                    </div>
                  </th>
                ))}
                <th className="w-[48px] px-2 py-2 border-r border-gray-200 text-center bg-gray-50"> {/* New column for "+" button */}
                  <button
                    onClick={() => console.log("Add new column clicked")}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </th>
                <th className="w-[48px] px-2 py-2 border-r border-gray-200 text-center bg-gray-50"> {/* New column for vertical dots */}
                  <button
                    onClick={() => console.log("More column options clicked")}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, rowIndex) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-150">
                  <td
                    className={`w-[48px] px-2 py-2 border-r border-gray-200 bg-gray-50 sticky left-0 z-0 ${
                      selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === 0 ? "ring-2 ring-blue-400 bg-blue-50 shadow-sm" : ""
                    }`}
                    onClick={() => handleCellClick(rowIndex, 0)} // # column is visibleColIndex 0
                  >
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(item.id)}
                        onChange={() => handleRowSelection(item.id)}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-1 transition-all duration-200"
                      />
                      <span className="text-xs text-gray-500 font-medium">{item.id}</span>
                    </div>
                  </td>
                  {columns.map((column, colIndex) => renderCell(item, column, rowIndex, colIndex))}
                  <td className="w-[48px] px-2 py-2 border-r border-gray-200 text-center"></td> {/* Empty cell for + column */}
                  <td className="w-[48px] px-2 py-2 border-r border-gray-200 text-center"></td> {/* Empty cell for vertical dots column */}
                </tr>
              ))}
              {/* Empty rows for spreadsheet feel */}
              {Array.from({ length: 10 }, (_, index) => {
                const emptyRowIndex = data.length + index
                return (
                  <tr key={`empty-${index}`} className="border-b border-gray-100 h-12 hover:bg-gray-50 transition-all duration-150">
                    <td
                      className={`w-[48px] px-2 py-2 border-r border-gray-200 bg-gray-50 sticky left-0 z-0 ${
                        selectedCell && selectedCell[0] === emptyRowIndex && selectedCell[1] === 0 ? "ring-2 ring-blue-400 bg-blue-50 shadow-sm" : ""
                      }`}
                      onClick={() => handleCellClick(emptyRowIndex, 0)}
                    >
                      <span className="text-xs text-gray-400 font-medium">{emptyRowIndex + 1}</span>
                    </td>
                    {columns.map((column, colIndex) => {
                      const visibleColIndex = colIndex + 1
                      const isSelectedEmpty = selectedCell && selectedCell[0] === emptyRowIndex && selectedCell[1] === visibleColIndex
                      const isEditingEmpty = editingCell && editingCell[0] === emptyRowIndex && editingCell[1] === visibleColIndex && isEditing

                      return (
                        <td
                          key={colIndex}
                          className={`${column.width} px-3 py-2 border-r border-gray-200 cursor-cell relative transition-all duration-150 ${
                            isSelectedEmpty ? "ring-2 ring-blue-400 bg-blue-50 shadow-sm z-10" : "hover:bg-gray-50"
                          } ${isEditingEmpty ? "bg-white" : ""}`}
                          onClick={() => handleCellClick(emptyRowIndex, visibleColIndex)}
                          onDoubleClick={() => handleCellDoubleClick(emptyRowIndex, visibleColIndex)}
                        >
                          {isEditingEmpty && (
                            <input
                              type="text"
                              className="w-full h-full bg-transparent outline-none text-sm border border-blue-400 rounded-sm p-0.5 focus:ring-0 absolute inset-0 box-border"
                              onBlur={() => {
                                setIsEditing(false)
                                setEditingCell(null)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  setIsEditing(false)
                                  setEditingCell(null)
                                }
                              }}
                              autoFocus
                            />
                          )}
                        </td>
                      )
                    })}
                    <td className="w-[48px] px-2 py-2 border-r border-gray-200 text-center"></td> {/* Empty cell for + column */}
                    <td className="w-[48px] px-2 py-2 border-r border-gray-200 text-center"></td> {/* Empty cell for vertical dots column */}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SpreadsheetApp;
