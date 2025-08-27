import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, deleteUser } from "firebase/auth";
import { auth } from "../firebase";
import { getFitnessData, getBMICategory } from "../services/fitnessService";
import { FitnessData } from "../services/fitnessService";
import { Card, Typography, Space, Button, Divider, Spin, Alert } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import { User } from "firebase/auth";

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [fitnessData, setFitnessData] = useState<FitnessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getFitnessData();
        if (isMounted) {
          setFitnessData(data);
        }
      } catch (err) {
        console.error('Error loading fitness data:', err);
        if (isMounted) {
          setError('Failed to load fitness data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/", { replace: true });
      } else {
        setUser(firebaseUser);
        loadData();
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigate]);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setDeleting(true);
      // First delete user data
      // Then delete the user account
      await deleteUser(user);
      setSuccess('Your account has been deleted successfully.');
      setTimeout(() => navigate('/'), 2000);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "auth/requires-recent-login") {
        setError("Please log out and log in again to delete your account.");
      } else {
        setError(err.message || "Failed to delete account.");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>;

  const formatDate = (date: Date | { toDate: () => Date } | null | undefined) => {
    if (!date) return 'Never';
    try {
      const dateObj = date instanceof Date ? date : date.toDate();
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const calculateAge = (dateString: string): number => {
    // Parse the date string (YYYY-MM-DD format)
    const [year, month, day] = dateString.split('-').map(Number);
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();
    
    let age = currentYear - year;
    
    // Adjust age if birthday hasn't occurred yet this year
    if (currentMonth < month || (currentMonth === month && currentDay < day)) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="profile-page" style={{
      maxWidth: 800,
      margin: "80px auto 20px",
      padding: "16px 24px"
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: 'var(--text-color)' }}>Profile</Title>
        <Button type="primary" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* User Information Card */}
        <Card 
          title={
            <Space>
              <UserOutlined />
              <span>Account Information</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <div style={{ marginBottom: 16 }}>
            <Text strong>Name:</Text>
            <div style={{ marginTop: 4 }}>{user.displayName || "(not set)"}</div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <Text strong>Email:</Text>
            <div style={{ marginTop: 4 }}>{user.email}</div>
          </div>
          
          <div style={{ marginTop: 24 }}>
            <Button 
              type="primary" 
              danger 
              onClick={handleDeleteAccount}
              loading={deleting}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </Button>
            {error && <Alert message={error} type="error" style={{ marginTop: 16 }} />}
            {success && <Alert message={success} type="success" style={{ marginTop: 16 }} />}
          </div>
        </Card>

        {/* Fitness Information Card */}
        <Card 
          title={
            <Space>
              <span>Fitness Information</span>
              <Link to="/personal-fitness">
                <Button type="link" icon={<EditOutlined />} size="small">Edit</Button>
              </Link>
            </Space>
          }
          style={{ marginBottom: 24 }}
          loading={loading}
        >
          {fitnessData ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <Text type="secondary">Age</Text>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>
                    {fitnessData?.dateOfBirth ? 
                      `${calculateAge(fitnessData.dateOfBirth)} years` : 
                      'Not set'}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Gender</Text>
                  <div style={{ fontSize: 16, fontWeight: 500, textTransform: 'capitalize' }}>{fitnessData.gender}</div>
                </div>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <Text type="secondary">Height</Text>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>
                    {fitnessData.height} cm ({(fitnessData.height / 2.54).toFixed(1)} in)
                  </div>
                </div>
                <div>
                  <Text type="secondary">Weight</Text>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>
                    {fitnessData.weight} kg ({(fitnessData.weight * 2.20462).toFixed(1)} lbs)
                  </div>
                </div>
              </div>
              
              {fitnessData.bmi && (
                <>
                  <Divider style={{ margin: '16px 0' }} />
                  <div>
                    <Text type="secondary">Body Mass Index (BMI)</Text>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                      {fitnessData.bmi.toFixed(1)} - {getBMICategory(fitnessData.bmi)}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Last updated: {formatDate(fitnessData.lastUpdated)}
                    </Text>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Text type="secondary">No fitness data available</Text>
              <div style={{ marginTop: 16 }}>
                <Link to="/personal-fitness">
                  <Button type="primary">Add Fitness Information</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
