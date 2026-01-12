import React, { useState } from 'react'
import './SellerSideBar.css';
import './Seller_statistics.css';
import { Link } from 'react-router-dom';
import { Car, Key, DollarSign, TrendingUp, Store, User } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);
import {  
  Activity, 
  Mail, 
  MapPin, 
  Calendar,
  Star,
  MessageSquare,
  Heart,
  Clock
} from 'lucide-react';
import Seller_SideBar from './SellerSideBar';
function Seller_statistics() {
  const user = {
    name: "Sarah Anderson",
    role: "Senior Developer",
    email: "sarah.anderson@example.com",
    location: "San Francisco, CA",
    joinDate: "March 2023",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    stats: {
      projects: 24,
      followers: 1240,
      following: 420,
      rating: 4.8
    },
    recentActivity: [
      { id: 1, type: "Project Update", description: "Completed the dashboard redesign", time: "2 hours ago" },
      { id: 2, type: "Code Review", description: "Reviewed frontend pull request #128", time: "5 hours ago" },
      { id: 3, type: "Team Chat", description: "Posted in #development channel", time: "1 day ago" }
    ]
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: [35000, 42000, 28000, 51000, 39000, 46000],
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Rental Revenue',
        data: [15000, 18000, 12000, 21000, 19000, 23000],
        backgroundColor: '#8b5cf6',
      }
    ],
  };

  // Vehicle Distribution Data
  const vehicleDistributionData = {
    labels: ['Vehicles Sold', 'Vehicles for Rent'],
    datasets: [
      {
        data: [15, 12],
        backgroundColor: ['#3b82f6', '#8b5cf6'],
      },
    ],
  };

  // Monthly Transaction Data
  const transactionData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales Transactions',
        data: [3, 2, 4, 2, 3, 1],
        borderColor: '#3b82f6',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Rental Listings',
        data: [2, 3, 1, 2, 2, 2],
        borderColor: '#8b5cf6',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  return (
    <div className="app">
      <nav className="sidebar">
       
      <Link to="/" style={{cursor:"pointer"}}><img className="logo" src="logo_without_bg.png" alt="" /></Link>

      
        <Seller_SideBar/>
        <div className="user-profile">
          <div className="avatar">DR</div>
          <div className="user-info">
            <h4>Dianne Russell</h4>
            <p>Admin</p>
          </div>
        </div>
      </nav>

      <main className="main-content">
       
        <div className="container">
              <div className="hero">
                <Store className="hero-icon" />
                <h1>Seller Dashboard</h1>
                <p>Your vehicle sales and rental performance overview</p>
              </div>
        
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Total Vehicles Sold</h3>
                    <Car className="stat-icon blue-icon" />
                  </div>
                  <p className="stat-value">15</p>
                  <p className="stat-change positive">+3 this month</p>
                </div>
        
                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Active Rentals</h3>
                    <Key className="stat-icon purple-icon" />
                  </div>
                  <p className="stat-value">12</p>
                  <p className="stat-change positive">+2 this month</p>
                </div>
        
                <div className="stat-card">
                  <div className="stat-header">
                    <h3>Total Revenue</h3>
                    <DollarSign className="stat-icon gold-icon" />
                  </div>
                  <p className="stat-value">$241,000</p>
                  <p className="stat-change positive">+15.3% from last month</p>
                </div>
              </div>
        
              {/* Charts Grid */}
              <div className="charts-grid">
                <div className="chart-card">
                  <h3>Monthly Revenue</h3>
                  <Bar 
                    data={revenueData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: { color: '#fff' }
                        },
                      },
                      scales: {
                        y: {
                          ticks: { color: '#9ca3af' },
                          grid: { color: '#374151' }
                        },
                        x: {
                          ticks: { color: '#9ca3af' },
                          grid: { color: '#374151' }
                        }
                      }
                    }}
                  />
                </div>
        
                <div className="chart-card">
                  <h3>Vehicle Distribution</h3>
                  <Doughnut 
                    data={vehicleDistributionData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: { color: '#fff' }
                        }
                      }
                    }}
                  />
                </div>
        
                <div className="chart-card wide">
                  <h3>Transaction History</h3>
                  <Line 
                    data={transactionData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: { color: '#fff' }
                        }
                      },
                      scales: {
                        y: {
                          ticks: { 
                            color: '#9ca3af',
                            stepSize: 1
                          },
                          grid: { color: '#374151' }
                        },
                        x: {
                          ticks: { color: '#9ca3af' },
                          grid: { color: '#374151' }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
      </main>
    </div>
  )
}

export default Seller_statistics