"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, CheckCircle, XCircle, AlertTriangle, Loader2, Database, User, Lock, Settings } from "lucide-react";
import { 
  checkMultiUserSetup, 
  getDatabaseStats, 
  validateDataIsolation, 
  testDatabaseOperations 
} from "@/lib/db-migration-utils";

interface ValidationResult {
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: string[];
}

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  result: ValidationResult;
  category: 'authentication' | 'database' | 'authorization' | 'configuration';
}

export function SecurityValidation() {
  const { user, profile } = useAuth();
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'success' | 'warning' | 'error'>('pending');

  const initializeChecks = (): SecurityCheck[] => [
    {
      id: 'auth-user',
      name: 'User Authentication',
      description: 'Verify user is properly authenticated',
      result: { status: 'pending', message: 'Checking authentication status...' },
      category: 'authentication'
    },
    {
      id: 'auth-profile',
      name: 'User Profile',
      description: 'Verify user profile exists and is accessible',
      result: { status: 'pending', message: 'Checking user profile...' },
      category: 'authentication'
    },
    {
      id: 'db-setup',
      name: 'Multi-User Database Setup',
      description: 'Verify database schema supports multi-user functionality',
      result: { status: 'pending', message: 'Checking database setup...' },
      category: 'database'
    },
    {
      id: 'db-stats',
      name: 'Database Statistics',
      description: 'Analyze database content and user data distribution',
      result: { status: 'pending', message: 'Analyzing database statistics...' },
      category: 'database'
    },
    {
      id: 'data-isolation',
      name: 'Data Isolation',
      description: 'Verify Row Level Security prevents cross-user data access',
      result: { status: 'pending', message: 'Validating data isolation...' },
      category: 'authorization'
    },
    {
      id: 'crud-operations',
      name: 'CRUD Operations',
      description: 'Test Create, Read, Update, Delete operations work correctly',
      result: { status: 'pending', message: 'Testing database operations...' },
      category: 'database'
    }
  ];

  const runSecurityChecks = async () => {
    setIsRunning(true);
    const newChecks = initializeChecks();
    setChecks(newChecks);

    try {
      // Check 1: User Authentication
      const authCheck = { ...newChecks[0] };
      if (user) {
        authCheck.result = {
          status: 'success',
          message: 'User is authenticated',
          details: [`User ID: ${user.id}`, `Email: ${user.email}`]
        };
      } else {
        authCheck.result = {
          status: 'error',
          message: 'No authenticated user found',
          details: ['User must be signed in to run security checks']
        };
      }
      newChecks[0] = authCheck;
      setChecks([...newChecks]);

      // Check 2: User Profile
      const profileCheck = { ...newChecks[1] };
      if (profile) {
        profileCheck.result = {
          status: 'success',
          message: 'User profile loaded successfully',
          details: [
            `Full Name: ${profile.full_name || 'Not set'}`,
            `Email: ${profile.email}`,
            `Created: ${new Date(profile.created_at).toLocaleDateString()}`
          ]
        };
      } else {
        profileCheck.result = {
          status: 'warning',
          message: 'User profile not found or not loaded',
          details: ['Profile should be created automatically on signup']
        };
      }
      newChecks[1] = profileCheck;
      setChecks([...newChecks]);

      // Check 3: Multi-User Database Setup
      const setupCheck = { ...newChecks[2] };
      try {
        const setup = await checkMultiUserSetup();
        const issues = [];
        if (!setup.hasUserIdColumns) issues.push('Missing user_id columns');
        if (!setup.hasRlsPolicies) issues.push('RLS policies not enabled');
        if (!setup.hasUserProfiles) issues.push('User profiles table missing');

        if (issues.length === 0) {
          setupCheck.result = {
            status: 'success',
            message: 'Multi-user database setup is complete',
            details: [
              '✓ User ID columns exist',
              '✓ RLS policies enabled',
              '✓ User profiles table exists'
            ]
          };
        } else {
          setupCheck.result = {
            status: 'error',
            message: 'Multi-user database setup incomplete',
            details: issues.map(issue => `✗ ${issue}`)
          };
        }
      } catch (error) {
        setupCheck.result = {
          status: 'error',
          message: 'Failed to check database setup',
          details: [`Error: ${error}`]
        };
      }
      newChecks[2] = setupCheck;
      setChecks([...newChecks]);

      // Check 4: Database Statistics
      const statsCheck = { ...newChecks[3] };
      try {
        const stats = await getDatabaseStats();
        statsCheck.result = {
          status: 'success',
          message: 'Database statistics analyzed',
          details: [
            `Total Entries: ${stats.totalEntries}`,
            `Entries with User: ${stats.entriesWithUser}`,
            `Orphaned Entries: ${stats.orphanedEntries}`,
            `Total Tags: ${stats.totalTags}`,
            `Tags with User: ${stats.tagsWithUser}`,
            `Orphaned Tags: ${stats.orphanedTags}`
          ]
        };
        
        if (stats.orphanedEntries > 0 || stats.orphanedTags > 0) {
          statsCheck.result.status = 'warning';
          statsCheck.result.message = 'Database has orphaned data';
        }
      } catch (error) {
        statsCheck.result = {
          status: 'error',
          message: 'Failed to analyze database statistics',
          details: [`Error: ${error}`]
        };
      }
      newChecks[3] = statsCheck;
      setChecks([...newChecks]);

      // Check 5: Data Isolation
      const isolationCheck = { ...newChecks[4] };
      try {
        const isolation = await validateDataIsolation();
        if (isolation.isValid) {
          isolationCheck.result = {
            status: 'success',
            message: 'Data isolation is working correctly',
            details: ['✓ No data leakage detected', '✓ RLS policies are effective']
          };
        } else {
          isolationCheck.result = {
            status: 'error',
            message: 'Data isolation issues detected',
            details: isolation.issues.map(issue => `✗ ${issue}`)
          };
        }
      } catch (error) {
        isolationCheck.result = {
          status: 'error',
          message: 'Failed to validate data isolation',
          details: [`Error: ${error}`]
        };
      }
      newChecks[4] = isolationCheck;
      setChecks([...newChecks]);

      // Check 6: CRUD Operations
      const crudCheck = { ...newChecks[5] };
      try {
        const crud = await testDatabaseOperations();
        const operations = [];
        if (crud.canCreate) operations.push('✓ Create');
        else operations.push('✗ Create');
        if (crud.canRead) operations.push('✓ Read');
        else operations.push('✗ Read');
        if (crud.canUpdate) operations.push('✓ Update');
        else operations.push('✗ Update');
        if (crud.canDelete) operations.push('✓ Delete');
        else operations.push('✗ Delete');

        if (crud.canCreate && crud.canRead && crud.canUpdate && crud.canDelete) {
          crudCheck.result = {
            status: 'success',
            message: 'All CRUD operations working correctly',
            details: operations
          };
        } else {
          crudCheck.result = {
            status: 'error',
            message: 'Some CRUD operations failed',
            details: [...operations, ...crud.errors]
          };
        }
      } catch (error) {
        crudCheck.result = {
          status: 'error',
          message: 'Failed to test CRUD operations',
          details: [`Error: ${error}`]
        };
      }
      newChecks[5] = crudCheck;
      setChecks([...newChecks]);

      // Calculate overall status
      const hasErrors = newChecks.some(check => check.result.status === 'error');
      const hasWarnings = newChecks.some(check => check.result.status === 'warning');
      
      if (hasErrors) {
        setOverallStatus('error');
      } else if (hasWarnings) {
        setOverallStatus('warning');
      } else {
        setOverallStatus('success');
      }

    } catch (error) {
      console.error('Security validation error:', error);
      setOverallStatus('error');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (user) {
      runSecurityChecks();
    }
  }, [user]);

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Loader2 className="animate-spin text-gray-500" size={20} />;
    }
  };

  const getCategoryIcon = (category: SecurityCheck['category']) => {
    switch (category) {
      case 'authentication':
        return <User className="text-blue-500" size={16} />;
      case 'database':
        return <Database className="text-purple-500" size={16} />;
      case 'authorization':
        return <Lock className="text-green-500" size={16} />;
      case 'configuration':
        return <Settings className="text-orange-500" size={16} />;
    }
  };

  const getOverallStatusColor = () => {
    switch (overallStatus) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-blue-600" size={32} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Security Validation
          </h1>
        </div>
        
        <div className={`p-4 rounded-lg border ${getOverallStatusColor()}`}>
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(overallStatus)}
            <span className="font-medium">
              {overallStatus === 'success' && 'All security checks passed'}
              {overallStatus === 'warning' && 'Security checks completed with warnings'}
              {overallStatus === 'error' && 'Security issues detected'}
              {overallStatus === 'pending' && 'Running security checks...'}
            </span>
          </div>
          <p className="text-sm">
            {overallStatus === 'success' && 'Your Project Diary authentication and security setup is working correctly.'}
            {overallStatus === 'warning' && 'Some non-critical issues were found. Review the warnings below.'}
            {overallStatus === 'error' && 'Critical security issues were detected. Please address them immediately.'}
            {overallStatus === 'pending' && 'Please wait while we validate your security configuration...'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {checks.map((check) => (
          <div key={check.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getCategoryIcon(check.category)}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {check.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {check.description}
                  </p>
                </div>
              </div>
              {getStatusIcon(check.result.status)}
            </div>
            
            <div className="ml-7">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {check.result.message}
              </p>
              
              {check.result.details && (
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {check.result.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isRunning && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={runSecurityChecks}
            disabled={isRunning}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Shield size={18} />
            Run Security Checks Again
          </button>
        </div>
      )}
    </div>
  );
}