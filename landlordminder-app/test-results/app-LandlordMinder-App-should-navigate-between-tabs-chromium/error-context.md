# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - img [ref=e7]
          - heading "LandlordMinder" [level=1] [ref=e10]
        - img [ref=e12]
    - navigation [ref=e15]:
      - generic [ref=e17]:
        - button "Dashboard" [ref=e18]:
          - img [ref=e19]
          - text: Dashboard
        - button "Properties" [ref=e22]:
          - img [ref=e23]
          - text: Properties
        - button "Tasks" [active] [ref=e26]:
          - img [ref=e27]
          - text: Tasks
        - button "Expenses" [ref=e29]:
          - img [ref=e30]
          - text: Expenses
    - main [ref=e32]:
      - generic [ref=e33]:
        - generic [ref=e34]:
          - heading "Maintenance Tasks" [level=2] [ref=e35]
          - button "Add Task" [ref=e36]:
            - img [ref=e37]
            - text: Add Task
        - generic [ref=e39]:
          - img [ref=e40]
          - heading "No tasks scheduled" [level=3] [ref=e42]
          - paragraph [ref=e43]: Add maintenance tasks to track recurring work
  - alert [ref=e44]
```