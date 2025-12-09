/**
 * Tridishti VS Code Extension Entry Point
 *
 * Integrates Jnana (knowledge), Karma (action), and Bhakti (reflection)
 * into developer workflows through VS Code commands and UI.
 *
 * This extension provides:
 * - Sutra checkpoints for periodic reflection
 * - Karma phala milestones with scoring
 * - Dharma sankata scope drift detection
 * - Jnana capture for knowledge artifacts
 * - Smriti recall for context recovery
 * - Atma vichara guided reflection
 * - Drishti dashboard for analytics
 */

import * as vscode from 'vscode';
import { SutraCheckpoints, ISutraCheckpointConfig } from './core/sutra-checkpoints';
import { KarmaPhala, IKarmaPhalaConfig } from './core/karma-phala';
import { DharmaSankata, IDharmaSankataConfig } from './core/dharma-sankata';
import { YatraManager, IYatraManagerConfig } from './core/yatra-manager';
import { JnanaCapture, IJnanaCaptureConfig } from './learning/jnana-capture';
import { SmritiRecall } from './learning/smriti-recall';
import { AtmaVichara, IAtmaVicharaConfig } from './reflection/atma-vichara';
import { DrishtiDashboard, IDrishtiDashboardConfig } from './analytics/drishti-dashboard';
import { ICoreEvent } from './core/types';
import { JnanaCategory } from './learning/types';

/**
 * Extension activation function
 * @param context VS Code extension context
 */
export function activate(context: vscode.ExtensionContext): void {
  // Initialize configuration from VS Code settings
  const config = vscode.workspace.getConfiguration('tridishti');

  // Create event emitter for core module communication
  const eventEmitter = new vscode.EventEmitter<ICoreEvent>();

  // Initialize core modules with configuration
  const sutraCheckpointsConfig: ISutraCheckpointConfig = {
    interval: config.get<number>('checkpointInterval', 30),
    autoCommit: config.get<boolean>('autoCommit', false),
    enabled: config.get<boolean>('enabled', true),
  };

  const karmaPhalaConfig: IKarmaPhalaConfig = {
    milestoneThreshold: config.get<number>('milestoneThreshold', 120),
    autoTag: config.get<boolean>('autoTag', false),
    enabled: config.get<boolean>('enabled', true),
    nudgeStrategy: config.get<string>('nudgeStrategy', 'default') as
      | 'default'
      | 'deep-work'
      | 'exploration'
      | 'maintenance',
  };

  const dharmaSankataConfig: IDharmaSankataConfig = {
    scopeCheckInterval: config.get<number>('scopeCheckInterval', 60),
    fileChangeThreshold: config.get<number>('fileChangeThreshold', 10),
    enabled: config.get<boolean>('enabled', true),
  };

  const yatraManagerConfig: IYatraManagerConfig = {
    enabled: config.get<boolean>('enabled', true),
    autoStart: false,
    persistState: true,
    sankalpaReminderInterval: 600, // 10 minutes
  };

  // Create module instances
  const sutraCheckpoints = new SutraCheckpoints(sutraCheckpointsConfig, eventEmitter);
  const karmaPhala = new KarmaPhala(karmaPhalaConfig, eventEmitter);
  const dharmaSankata = new DharmaSankata(dharmaSankataConfig, eventEmitter);
  const yatraManager = new YatraManager(
    yatraManagerConfig,
    eventEmitter,
    sutraCheckpoints,
    karmaPhala,
    dharmaSankata,
    context.globalState
  );

  // Initialize learning modules
  const jnanaCaptureConfig: IJnanaCaptureConfig = {
    enabled: config.get<boolean>('enabled', true),
    categories: config.get<string[]>('learningCategories', [
      'insight',
      'gotcha',
      'pattern',
      'solution',
      'question',
    ]) as JnanaCategory[],
    autoCapture: false,
    defaultCategory: 'insight',
  };

  const jnanaCapture = new JnanaCapture(jnanaCaptureConfig);
  const smritiRecall = new SmritiRecall({ provider: 'memory' }, jnanaCapture);

  // Initialize reflection module
  const atmaVicharaConfig: IAtmaVicharaConfig = {
    enabled: config.get<boolean>('enabled', true),
    autoReflect: false,
    promptTemplates: {
      start: "Welcome to Atma Vichara (self-inquiry). Let's reflect on your coding session.",
      achievements: 'What achievements stand out from this session?',
      improvements: 'What could be improved in your workflow?',
      closing: 'Thank you for taking time to reflect. May your next session be even more aligned.',
    },
  };

  const atmaVichara = new AtmaVichara(atmaVicharaConfig);

  // Initialize analytics module
  const drishtiDashboardConfig: IDrishtiDashboardConfig = {
    enabled: config.get<boolean>('enabled', true),
    maxEvents: 1000,
    telemetryEnabled: true,
  };

  const drishtiDashboard = new DrishtiDashboard(drishtiDashboardConfig);

  // Set up event subscriptions for dashboard
  eventEmitter.event(event => {
    drishtiDashboard.recordEvent(event);
  });

  // Register VS Code commands
  const createSutraCommand = vscode.commands.registerCommand('tridishti.createSutra', async () => {
    const message = await vscode.window.showInputBox({
      prompt: 'Enter checkpoint message (optional)',
      placeHolder: 'What are you working on?',
    });

    try {
      const checkpoint = await sutraCheckpoints.createCheckpoint(message);
      vscode.window.showInformationMessage(`Sutra checkpoint created: ${checkpoint.id}`);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to create checkpoint: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });

  const createKarmaPhalaCommand = vscode.commands.registerCommand(
    'tridishti.createKarmaPhala',
    async () => {
      const name = await vscode.window.showInputBox({
        prompt: 'Enter milestone name',
        placeHolder: 'What milestone are you reaching?',
        validateInput: value => {
          return value.trim().length === 0 ? 'Milestone name is required' : undefined;
        },
      });

      if (name) {
        try {
          const milestone = karmaPhala.createMilestone(name.trim());
          vscode.window.showInformationMessage(`Karma Phala milestone created: ${milestone.name}`);
        } catch (error) {
          vscode.window.showErrorMessage(
            `Failed to create milestone: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    }
  );

  const captureJnanaCommand = vscode.commands.registerCommand(
    'tridishti.captureJnana',
    async () => {
      const content = await vscode.window.showInputBox({
        prompt: 'Enter knowledge to capture',
        placeHolder: 'What insight, pattern, or solution did you discover?',
        validateInput: value => {
          return value.trim().length === 0 ? 'Knowledge content is required' : undefined;
        },
      });

      if (content) {
        const category = await vscode.window.showQuickPick(
          ['insight', 'gotcha', 'pattern', 'solution', 'question'],
          {
            placeHolder: 'Select knowledge category',
            canPickMany: false,
          }
        );

        if (category) {
          try {
            const jnana = jnanaCapture.capture(content.trim(), category as JnanaCategory);
            await smritiRecall.save(jnana);
            drishtiDashboard.recordJnana([jnana]);

            vscode.window.showInformationMessage(`Jnana captured: ${jnana.id} (${category})`);
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed to capture jnana: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      }
    }
  );

  const checkDharmaCommand = vscode.commands.registerCommand('tridishti.checkDharma', async () => {
    try {
      const sankata = await dharmaSankata.checkScope();

      if (sankata.detected) {
        const action = await vscode.window.showWarningMessage(
          `Dharma Sankata detected: ${sankata.reason}`,
          'View Details',
          'Dismiss'
        );

        if (action === 'View Details') {
          const panel = vscode.window.createWebviewPanel(
            'dharma-alert',
            'Dharma Sankata Alert',
            vscode.ViewColumn.One,
            {}
          );
          panel.webview.html = getDharmaAlertWebviewContent(sankata);
        }
      } else {
        vscode.window.showInformationMessage('No scope drift detected. Dharma is aligned! 🕉️');
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to check dharma: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });

  const showYatraCommand = vscode.commands.registerCommand('tridishti.showYatra', async () => {
    try {
      const yatra = yatraManager.getCurrentYatra();

      if (yatra) {
        const panel = vscode.window.createWebviewPanel(
          'yatra',
          `Current Yatra: ${yatra.sankalpa || 'Untitled Session'}`,
          vscode.ViewColumn.One,
          { enableScripts: true }
        );
        panel.webview.html = getYatraWebviewContent(yatra);

        // Handle messages from webview
        panel.webview.onDidReceiveMessage(
          async message => {
            switch (message.type) {
              case 'updateSankalpa':
                try {
                  yatraManager.updateSankalpa(message.sankalpa);
                  vscode.window.showInformationMessage('Sankalpa updated successfully');
                  panel.dispose();
                } catch (error) {
                  vscode.window.showErrorMessage('Failed to update Sankalpa');
                }
                break;
            }
          },
          undefined,
          context.subscriptions
        );
      } else {
        vscode.window.showInformationMessage(
          'No active yatra. Start one to begin your journey! 🚶'
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to show yatra: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });

  const showDrishtiCommand = vscode.commands.registerCommand('tridishti.showDrishti', async () => {
    try {
      const metrics = drishtiDashboard.getMetrics(yatraManager.getCurrentYatra());
      const health = drishtiDashboard.getHealthStatus();

      const panel = vscode.window.createWebviewPanel(
        'drishti',
        'Drishti Dashboard - Vision into Your Coding',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      panel.webview.html = getDrishtiWebviewContent(metrics, health);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to show dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });

  const atmaVicharaCommand = vscode.commands.registerCommand('tridishti.atmaVichara', async () => {
    try {
      const yatra = yatraManager.getCurrentYatra();

      if (!yatra) {
        vscode.window.showWarningMessage(
          'No active yatra to reflect on. Complete a session first!'
        );
        return;
      }

      // End the current yatra
      const completedYatra = await yatraManager.endYatra();

      // Perform reflection
      const capturedJnana = jnanaCapture.getAllJnana();
      const reflection = atmaVichara.reflect(completedYatra, capturedJnana);
      drishtiDashboard.recordReflection(reflection);

      // Generate prompts
      const prompts = atmaVichara.generatePrompts(completedYatra);

      // Show reflection webview
      const panel = vscode.window.createWebviewPanel(
        'atmaVichara',
        `Atma Vichara - Reflecting on "${completedYatra.sankalpa || 'Your Session'}"`,
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      panel.webview.html = getAtmaVicharaWebviewContent(reflection, prompts);

      vscode.window.showInformationMessage(
        `Session completed! Score: ${reflection.score}/100. Take time to reflect. 🪞`
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to perform Atma Vichara: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });

  // Auto-start yatra if configured
  if (yatraManagerConfig.autoStart) {
    yatraManager
      .startYatra()
      .then(yatra => {
        vscode.window.showInformationMessage(
          `Yatra started automatically: ${yatra.sankalpa || 'New session'}`
        );
      })
      .catch(error => {
        vscode.window.showErrorMessage(
          `Failed to auto-start yatra: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      });
  } else {
    // Restore previous state if available
    yatraManager
      .restoreState()
      .then(() => {
        const currentYatra = yatraManager.getCurrentYatra();
        if (currentYatra) {
          vscode.window.showInformationMessage(
            `Previous yatra restored: ${currentYatra.sankalpa || 'Untitled session'}`
          );
        }
      })
      .catch(error => {
        // Silently handle restoration errors
        console.warn('Failed to restore yatra state:', error);
      });
  }

  // Register all commands and subscriptions
  context.subscriptions.push(
    createSutraCommand,
    createKarmaPhalaCommand,
    captureJnanaCommand,
    checkDharmaCommand,
    showYatraCommand,
    showDrishtiCommand,
    atmaVicharaCommand,
    eventEmitter
  );

  // Set up configuration change listener
  const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('tridishti')) {
      // Reload configuration and update modules
      const newConfig = vscode.workspace.getConfiguration('tridishti');

      // Update core modules with new config
      sutraCheckpoints.updateConfig({
        interval: newConfig.get<number>('checkpointInterval', 30),
        autoCommit: newConfig.get<boolean>('autoCommit', false),
        enabled: newConfig.get<boolean>('enabled', true),
      });

      karmaPhala.updateConfig({
        milestoneThreshold: newConfig.get<number>('milestoneThreshold', 120),
        autoTag: newConfig.get<boolean>('autoTag', false),
        enabled: newConfig.get<boolean>('enabled', true),
        nudgeStrategy: newConfig.get<string>('nudgeStrategy', 'default') as any,
      });

      dharmaSankata.updateConfig({
        scopeCheckInterval: newConfig.get<number>('scopeCheckInterval', 60),
        fileChangeThreshold: newConfig.get<number>('fileChangeThreshold', 10),
        enabled: newConfig.get<boolean>('enabled', true),
      });
    }
  });

  context.subscriptions.push(configChangeDisposable);

  // Extension is now fully activated
  console.log('Tridishti extension activated with threefold vision: Jnana, Karma, Bhakti');
}

/**
 * Extension deactivation function
 */
export function deactivate(): void {
  // Cleanup is handled automatically by VS Code disposing subscriptions
  console.log('Tridishti extension deactivated');
}

/**
 * Escapes HTML special characters
 * @param text Text to escape
 * @returns Escaped HTML string
 */
function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates HTML content for yatra webview
 * @param yatra Yatra to display
 * @returns HTML string
 */
export function getYatraWebviewContent(yatra: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Current Yatra</title>
  <style>
    body { font-family: var(--vscode-font-family); padding: 20px; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
    h1 { color: var(--vscode-textLink-foreground); margin-bottom: 30px; }
    .section { margin: 20px 0; padding: 15px; background: var(--vscode-editorWidget-background); border-radius: 8px; border: 1px solid var(--vscode-widget-border); }
    .section h2 { margin-top: 0; color: var(--vscode-textLink-foreground); }
    .checkpoint, .milestone, .alert { padding: 10px; margin: 5px 0; background: var(--vscode-input-background); border-left: 3px solid var(--vscode-textLink-foreground); border-radius: 4px; }
    .sankalpa-input { width: 100%; padding: 8px; margin: 10px 0; border: 1px solid var(--vscode-input-border); border-radius: 4px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); }
    .button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 5px; }
    .button:hover { background: var(--vscode-button-hoverBackground); }
  </style>
</head>
<body>
  <h1>🚶 Current Yatra</h1>

  <div class="section">
    <h2>🕉️ Sankalpa (Intention)</h2>
    <p><strong>Current:</strong> ${escapeHtml(yatra.sankalpa) || 'Not set'}</p>
    <input type="text" class="sankalpa-input" id="sankalpaInput" placeholder="Set your intention for this session..." value="${escapeHtml(yatra.sankalpa || '')}">
    <button class="button" onclick="updateSankalpa()">Update Sankalpa</button>
  </div>

  <div class="section">
    <h2>🧵 Sutra Checkpoints (${yatra.checkpoints.length})</h2>
    ${
      yatra.checkpoints.length > 0
        ? yatra.checkpoints
            .map((cp: any) => `<div class="checkpoint">${escapeHtml(cp.message || cp.id)}</div>`)
            .join('')
        : '<p>No checkpoints yet. Create your first with Ctrl+Shift+P → "Tridishti: Create Sutra"</p>'
    }
  </div>

  <div class="section">
    <h2>🌸 Karma Phala Milestones (${yatra.milestones.length})</h2>
    ${
      yatra.milestones.length > 0
        ? yatra.milestones
            .map((m: any) => `<div class="milestone">${escapeHtml(m.name)} - ${escapeHtml(m.status)}</div>`)
            .join('')
        : '<p>No milestones yet. Create your first with Ctrl+Shift+P → "Tridishti: Create Karma Phala Milestone"</p>'
    }
  </div>

  <div class="section">
    <h2>⚠️ Dharma Alerts (${yatra.dharmaAlerts.length})</h2>
    ${
      yatra.dharmaAlerts.length > 0
        ? yatra.dharmaAlerts
            .map((a: any) => `<div class="alert">${escapeHtml(a.reason)}: ${escapeHtml(a.suggestion || '')}</div>`)
            .join('')
        : '<p>No scope drift detected. Your dharma is aligned! 🕉️</p>'
    }
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function updateSankalpa() {
      const sankalpa = document.getElementById('sankalpaInput').value.trim();
      if (sankalpa) {
        vscode.postMessage({
          type: 'updateSankalpa',
          sankalpa: sankalpa
        });
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Generates HTML content for dharma alert webview
 * @param sankata Dharma sankata alert
 * @returns HTML string
 */
export function getDharmaAlertWebviewContent(sankata: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dharma Sankata Alert</title>
  <style>
    body { font-family: var(--vscode-font-family); padding: 20px; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
    h1 { color: var(--vscode-notificationsWarningIcon-foreground); }
    .alert { padding: 20px; background: var(--vscode-notificationsWarningIcon-foreground); opacity: 0.1; border-radius: 8px; margin: 20px 0; border-left: 4px solid var(--vscode-notificationsWarningIcon-foreground); }
    .details { background: var(--vscode-editorWidget-background); padding: 15px; border-radius: 8px; margin: 15px 0; }
    .suggestion { background: var(--vscode-textLink-foreground); opacity: 0.1; padding: 15px; border-radius: 8px; border-left: 4px solid var(--vscode-textLink-foreground); }
  </style>
</head>
<body>
  <h1>⚠️ Dharma Sankata Detected</h1>

  <div class="alert">
    <h2>${escapeHtml(sankata.reason.replace('_', ' ').toUpperCase())}</h2>
    <p><strong>Reason:</strong> ${escapeHtml(sankata.reason)}</p>
    <p><strong>Detected:</strong> ${sankata.detected ? 'Yes' : 'No'}</p>
  </div>

  <div class="details">
    <h3>Details</h3>
    <ul>
      <li><strong>Files Changed:</strong> ${sankata.details.filesChanged}</li>
      <li><strong>Threshold:</strong> ${sankata.details.threshold}</li>
      ${sankata.details.currentGoal ? `<li><strong>Current Goal:</strong> ${escapeHtml(sankata.details.currentGoal)}</li>` : ''}
      ${sankata.details.detectedGoal ? `<li><strong>Detected Goal:</strong> ${escapeHtml(sankata.details.detectedGoal)}</li>` : ''}
    </ul>
  </div>

  ${
    sankata.suggestion
      ? `
  <div class="suggestion">
    <h3>💡 Suggestion</h3>
    <p>${escapeHtml(sankata.suggestion)}</p>
  </div>
  `
      : ''
  }

  <p><em>Remember: "You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions." - Bhagavad Gita 2.47</em></p>
</body>
</html>`;
}

/**
 * Generates HTML content for drishti dashboard webview
 * @param metrics Dashboard metrics
 * @param health Health status
 * @returns HTML string
 */
/**
 * Generates HTML content for drishti dashboard webview
 * @param metrics Dashboard metrics
 * @param health Health status
 * @returns HTML string
 */
export function getDrishtiWebviewContent(metrics: any, health: any): string {
  const healthColors: Record<string, string> = {
    healthy: '#4CAF50',
    degraded: '#FF9800',
    unhealthy: '#F44336',
  };
  const healthColor = healthColors[health.status] || '#666';

  // Productivity score color coding
  const getProductivityColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FFC107';
    return '#F44336';
  };
  const productivityColor = getProductivityColor(metrics.productivityScore);

  // Format event type for display
  const formatEventType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get event icon
  const getEventIcon = (type: string): string => {
    const icons: Record<string, string> = {
      checkpoint: '🧵',
      milestone: '🌸',
      dharma_alert: '⚠️',
      yatra_start: '🚀',
      yatra_end: '✅',
      jnana_capture: '📚',
    };
    return icons[type] || '📌';
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drishti Dashboard</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      padding: 20px;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      margin: 0;
    }
    h1 {
      color: var(--vscode-textLink-foreground);
      text-align: center;
      margin-bottom: 10px;
      font-size: 24px;
    }
    h2, h3 {
      margin-top: 0;
      margin-bottom: 15px;
    }
    .health {
      padding: 20px;
      background: ${healthColor}20;
      border: 2px solid ${healthColor};
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .health h2 {
      color: ${healthColor};
      margin: 0 0 10px 0;
      font-size: 20px;
    }
    .health p {
      margin: 5px 0;
      font-size: 14px;
    }
    .active-yatra {
      background: var(--vscode-editorWidget-background);
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid var(--vscode-widget-border);
    }
    .active-yatra h3 {
      margin-top: 0;
      color: var(--vscode-textLink-foreground);
    }
    .active-yatra-info {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 14px;
    }
    .active-yatra-info span {
      color: var(--vscode-descriptionForeground);
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .metric {
      background: var(--vscode-editorWidget-background);
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid var(--vscode-widget-border);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .metric:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .metric-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 36px;
      font-weight: bold;
      color: var(--vscode-textLink-foreground);
      line-height: 1.2;
    }
    .metric.productivity .metric-value {
      color: ${productivityColor};
    }
    .metric-label {
      font-size: 13px;
      color: var(--vscode-descriptionForeground);
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .recent-activity {
      background: var(--vscode-editorWidget-background);
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 1px solid var(--vscode-widget-border);
    }
    .recent-activity h3 {
      margin-top: 0;
      color: var(--vscode-textLink-foreground);
    }
    .activity-item {
      padding: 10px 0;
      border-bottom: 1px solid var(--vscode-list-inactiveSelectionBackground);
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }
    .activity-item:last-child {
      border-bottom: none;
    }
    .activity-icon {
      font-size: 18px;
    }
    .activity-type {
      font-weight: 600;
      color: var(--vscode-textLink-foreground);
      flex: 1;
    }
    .activity-time {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }
    .module-health {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin-top: 15px;
    }
    .module-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      padding: 5px;
    }
    .module-status {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #4CAF50;
    }
    .footer {
      text-align: center;
      color: var(--vscode-descriptionForeground);
      font-style: italic;
      font-size: 13px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid var(--vscode-widget-border);
    }
  </style>
</head>
<body>
  <h1>👁️ Drishti Dashboard - Vision into Your Coding</h1>

  <div class="health">
    <h2>System Health: ${health.status.toUpperCase()}</h2>
    <p>Last event: ${health.lastEventTime ? new Date(health.lastEventTime).toLocaleString() : 'Never'}</p>
    <div class="module-health">
      ${Object.entries(health.modules)
        .map(
          ([module, status]) =>
            `<div class="module-item">
          <span class="module-status" style="background: ${status ? '#4CAF50' : '#F44336'}"></span>
          <span>${module.replace(/([A-Z])/g, ' $1').trim()}</span>
        </div>`
        )
        .join('')}
    </div>
  </div>

  ${
    metrics.activeYatra
      ? `
  <div class="active-yatra">
    <h3>🚀 Active Yatra</h3>
    <div class="active-yatra-info">
      <span><strong>Sankalpa:</strong> ${metrics.activeYatra.sankalpa || 'Untitled session'}</span>
      <span><strong>Started:</strong> ${new Date(metrics.activeYatra.startedAt).toLocaleString()}</span>
      <span><strong>Checkpoints:</strong> ${metrics.activeYatra.checkpoints.length}</span>
      <span><strong>Milestones:</strong> ${metrics.activeYatra.milestones.length}</span>
      <span><strong>Alerts:</strong> ${metrics.activeYatra.dharmaAlerts.length}</span>
    </div>
  </div>
  `
      : ''
  }

  <div class="metrics-grid">
    <div class="metric">
      <div class="metric-icon">🧘</div>
      <div class="metric-value">${metrics.totalYatras}</div>
      <div class="metric-label">Total Yatras</div>
    </div>
    <div class="metric">
      <div class="metric-icon">🧵</div>
      <div class="metric-value">${metrics.totalCheckpoints}</div>
      <div class="metric-label">Sutra Checkpoints</div>
    </div>
    <div class="metric">
      <div class="metric-icon">🌸</div>
      <div class="metric-value">${metrics.totalMilestones}</div>
      <div class="metric-label">Karma Phala</div>
    </div>
    <div class="metric">
      <div class="metric-icon">⚠️</div>
      <div class="metric-value">${metrics.totalDharmaAlerts}</div>
      <div class="metric-label">Dharma Alerts</div>
    </div>
    <div class="metric">
      <div class="metric-icon">📚</div>
      <div class="metric-value">${metrics.totalJnana}</div>
      <div class="metric-label">Jnana Captured</div>
    </div>
    <div class="metric productivity">
      <div class="metric-icon">📊</div>
      <div class="metric-value">${metrics.productivityScore}</div>
      <div class="metric-label">Productivity Score</div>
    </div>
    ${
      metrics.averageSessionDuration > 0
        ? `
    <div class="metric">
      <div class="metric-icon">⏱️</div>
      <div class="metric-value">${metrics.averageSessionDuration}</div>
      <div class="metric-label">Avg Session (min)</div>
    </div>
    `
        : ''
    }
  </div>

  <div class="recent-activity">
    <h3>Recent Activity</h3>
    ${
      metrics.recentActivity.length > 0
        ? metrics.recentActivity
            .map(
              (event: any) =>
                `<div class="activity-item">
            <span class="activity-icon">${getEventIcon(event.type)}</span>
            <span class="activity-type">${formatEventType(event.type)}</span>
            <span class="activity-time">${new Date(event.timestamp).toLocaleString()}</span>
          </div>`
            )
            .join('')
        : '<p style="color: var(--vscode-descriptionForeground);">No recent activity</p>'
    }
  </div>

  <div class="footer">
    "The vision of the drishti extends beyond the material world." - Ancient Wisdom
  </div>
</body>
</html>`;
}

/**
 * Generates HTML content for atma vichara webview
 * @param reflection Reflection result
 * @param prompts Reflection prompts
 * @returns HTML string
 */
export function getAtmaVicharaWebviewContent(reflection: any, prompts: string[]): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atma Vichara</title>
  <style>
    body { font-family: var(--vscode-font-family); padding: 20px; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground); }
    h1 { color: var(--vscode-textLink-foreground); text-align: center; }
    .score { text-align: center; font-size: 48px; font-weight: bold; color: var(--vscode-textLink-foreground); margin: 20px 0; }
    .section { background: var(--vscode-editorWidget-background); padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid var(--vscode-widget-border); }
    .section h2 { color: var(--vscode-textLink-foreground); margin-top: 0; }
    .prompt { background: var(--vscode-input-background); padding: 15px; margin: 10px 0; border-left: 4px solid var(--vscode-textLink-foreground); border-radius: 4px; }
    .list { list-style-type: none; padding: 0; }
    .list li { padding: 8px 0; border-bottom: 1px solid var(--vscode-list-inactiveSelectionBackground); }
    .list li:last-child { border-bottom: none; }
    .insights { background: #4CAF5020; border-left-color: #4CAF50; }
    .improvements { background: #FF980020; border-left-color: #FF9800; }
    .achievements { background: #2196F320; border-left-color: #2196F3; }
    .suggestions { background: #9C27B020; border-left-color: #9C27B0; }
  </style>
</head>
<body>
  <h1>🪞 Atma Vichara - Self Inquiry</h1>

  ${
    reflection.score !== undefined
      ? `
    <div class="score">
      ${reflection.score}/100
      <div style="font-size: 16px; color: var(--vscode-descriptionForeground); margin-top: 10px;">
        ${
          reflection.score >= 80
            ? 'Excellent session! 🌟'
            : reflection.score >= 60
              ? 'Good progress made 📈'
              : reflection.score >= 40
                ? 'Room for improvement 📝'
                : 'Consider reviewing your approach 🔄'
        }
      </div>
    </div>
  `
      : ''
  }

  <div class="section">
    <h2>🧘 Guided Reflection Prompts</h2>
    ${prompts.map(prompt => `<div class="prompt">${escapeHtml(prompt)}</div>`).join('')}
  </div>

  <div class="section insights">
    <h2>🔍 Insights</h2>
    <ul class="list">
      ${reflection.insights.map((insight: string) => `<li>${escapeHtml(insight)}</li>`).join('')}
    </ul>
  </div>

  <div class="section achievements">
    <h2>🏆 Achievements</h2>
    <ul class="list">
      ${reflection.achievements.map((achievement: string) => `<li>${escapeHtml(achievement)}</li>`).join('')}
    </ul>
  </div>

  <div class="section improvements">
    <h2>📈 Improvements</h2>
    <ul class="list">
      ${reflection.improvements.map((improvement: string) => `<li>${escapeHtml(improvement)}</li>`).join('')}
    </ul>
  </div>

  <div class="section suggestions">
    <h2>💡 Suggestions for Future Sessions</h2>
    <ul class="list">
      ${reflection.suggestions.map((suggestion: string) => `<li>${escapeHtml(suggestion)}</li>`).join('')}
    </ul>
  </div>

  <div style="text-align: center; margin: 40px 0; padding: 20px; background: var(--vscode-textLink-foreground); opacity: 0.1; border-radius: 8px;">
    <p style="margin: 0; font-style: italic; color: var(--vscode-descriptionForeground);">
      "Self-inquiry is the sword that frees the soul from the chains of ignorance."
    </p>
    <p style="margin: 5px 0 0 0; font-size: 14px; color: var(--vscode-descriptionForeground);">
      - Ancient spiritual teaching
    </p>
  </div>
</body>
</html>`;
}
